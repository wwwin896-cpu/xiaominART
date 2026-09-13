import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const port = 4399;
const base = `http://127.0.0.1:${port}`;
const testDataDir = path.join(os.tmpdir(), `xiaominart-test-${process.pid}`);
let server;

async function request(path, options = {}) {
  return fetch(base + path, options);
}

test.before(async () => {
  await rm(testDataDir, { recursive: true, force: true });
  server = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, NODE_ENV: 'test', PORT: String(port), DATA_DIR: testDataDir, ADMIN_PASSWORD: 'test-password-1234' }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server startup timeout')), 5000);
    server.stdout.on('data', chunk => { if (chunk.toString().includes('running at')) { clearTimeout(timer); resolve(); } });
    server.on('error', reject);
  });
});

test.after(async () => { server.kill(); await once(server, 'exit').catch(() => {}); });

test('public pages and product API work', async () => {
  const home = await request('/');
  assert.equal(home.status, 200);
  assert.match(await home.text(), /把日子，写成字/);
  const products = await request('/api/products');
  assert.equal(products.status, 200);
  assert.equal((await products.json()).length, 5);
});

test('custom request persists without story', async () => {
  const response = await request('/api/custom-requests', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: '测试客户', contact: 'demo@example.com', text: '福', recipient: '给家人', scene: '新年与节庆', story: '' }) });
  assert.equal(response.status, 201);
  assert.match((await response.json()).requestNumber, /^CUSTOM-/);
});

test('success order validates server price and decrements unique inventory', async () => {
  const response = await request('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customer: { name: '虚拟客户', contact: 'demo@example.com', address: '测试地址' }, items: [{ id: 'F', quantity: 1, price: 0 }], payment: 'success' }) });
  assert.equal(response.status, 201);
  const order = await response.json();
  const result = await request(`/api/orders/${order.accessToken}`);
  const data = await result.json();
  assert.equal(data.total, 99);
  assert.equal(data.status, '模拟支付成功');
  const products = await (await request('/api/products')).json();
  assert.equal(products.find(p => p.id === 'F').stock, 0);
});

test('failure and cancellation are not successful payments', async () => {
  for (const payment of ['failure', 'cancelled']) {
    const response = await request('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customer: { name: '虚拟客户', contact: 'demo@example.com', address: '测试地址' }, items: [{ id: 'X', quantity: 1 }], payment }) });
    assert.equal(response.status, 201);
    const order = await response.json();
    const data = await (await request(`/api/orders/${order.accessToken}`)).json();
    assert.notEqual(data.status, '模拟支付成功');
  }
});

test('concurrent success requests cannot sell one unique original twice', async () => {
  const payload = { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customer: { name: '并发测试客户', contact: 'demo@example.com', address: '测试地址' }, items: [{ id: 'S', quantity: 1 }], payment: 'success' }) };
  const responses = await Promise.all([request('/api/orders', payload), request('/api/orders', payload)]);
  assert.deepEqual(responses.map(response => response.status).sort(), [201, 409]);
});

test('admin requires auth and can inspect summary', async () => {
  assert.equal((await request('/api/admin/summary')).status, 401);
  const login = await request('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'test-password-1234' }) });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const summary = await request('/api/admin/summary', { headers: { cookie } });
  assert.equal(summary.status, 200);
  const data = await summary.json();
  assert.ok(data.orders.length >= 3);
  assert.ok(data.customRequests.length >= 1);
  const product = data.products.find(item => item.id === 'L');
  const productUpdate = await request(`/api/admin/products/${product.id}`, { method: 'PATCH', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ stock: 2 }) });
  assert.equal(productUpdate.status, 200);
  const custom = data.customRequests[0];
  const customUpdate = await request(`/api/admin/custom-requests/${custom.id}`, { method: 'PATCH', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ status: '已联系' }) });
  assert.equal(customUpdate.status, 200);
});

test('idempotency returns one order and rejects same-key conflicts', async () => {
  const headers = { 'content-type': 'application/json', 'idempotency-key': 'order-key-12345678' };
  const payload = JSON.stringify({ customer: { name: '幂等客户', contact: 'idem@example.com', address: '测试地址' }, items: [{ id: 'X', quantity: 2 }], payment: 'success' });
  const first = await request('/api/orders', { method: 'POST', headers, body: payload });
  const second = await request('/api/orders', { method: 'POST', headers, body: payload });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.equal((await first.json()).orderNumber, (await second.json()).orderNumber);
  const conflict = await request('/api/orders', { method: 'POST', headers, body: JSON.stringify({ customer: { name: '另一客户', contact: 'other@example.com', address: '测试地址' }, items: [{ id: 'X', quantity: 1 }], payment: 'success' }) });
  assert.equal(conflict.status, 409);
});

test('custom idempotency, field whitelist and exact type validation', async () => {
  const headers = { 'content-type': 'application/json', 'idempotency-key': 'custom-key-12345678' };
  const payload = JSON.stringify({ id: 'attacker', requestNumber: 'CUSTOM-FAKE', status: '已完成', name: '字段客户', contact: 'field@example.com', text: '心意', story: '  ' });
  const first = await request('/api/custom-requests', { method: 'POST', headers, body: payload });
  const second = await request('/api/custom-requests', { method: 'POST', headers, body: payload });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  const created = await first.json();
  assert.notEqual(created.id, 'attacker');
  assert.notEqual(created.requestNumber, 'CUSTOM-FAKE');
  assert.equal(created.status, '新提交');
  assert.equal((await request('/api/custom-requests', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'x', contact: 'x', text: 123 }) })).status, 400);
});

test('unpublished product cannot be listed, viewed or purchased', async () => {
  const login = await request('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'test-password-1234' }) });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal((await request('/api/admin/products/X', { method: 'PATCH', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ published: false }) })).status, 200);
  assert.equal((await request('/api/products/X')).status, 404);
  assert.equal((await request('/shop/xi')).status, 404);
  assert.equal((await request('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customer: { name: '下架客户', contact: 'offline@example.com', address: '测试地址' }, items: [{ id: 'X', quantity: 1 }], payment: 'success' }) })).status, 409);
});

test('order snapshot keeps specs and rejects invalid payment and quantity types', async () => {
  const invalidPayment = await request('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customer: { name: '类型客户', contact: 'type@example.com', address: '测试地址' }, items: [{ id: 'L', quantity: true }], payment: 'unknown' }) });
  assert.equal(invalidPayment.status, 400);
  const orderResponse = await request('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customer: { name: '快照客户', contact: 'snap@example.com', address: '测试地址' }, items: [{ id: 'L', specId: 'standard', quantity: 1 }], payment: 'failure' }) });
  assert.equal(orderResponse.status, 201);
  const order = await orderResponse.json();
  const detail = await (await request(`/api/orders/${order.accessToken}`)).json();
  assert.equal(detail.items[0].specLabel, '演示标准斗方');
  assert.equal(detail.items[0].price, 299);
  assert.equal((await request(`/api/orders/not-a-token`)).status, 404);
});

test('admin state transitions are constrained and audit payment wording', async () => {
  const login = await request('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'test-password-1234' }) });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const created = await request('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customer: { name: '状态客户', contact: 'state@example.com', address: '测试地址' }, items: [{ id: 'C', quantity: 1 }], payment: 'success' }) });
  const orderInfo = await created.json();
  const summary = await (await request('/api/admin/summary', { headers: { cookie } })).json();
  const order = summary.orders.find(item => item.orderNumber === orderInfo.orderNumber);
  const invalid = await request(`/api/admin/orders/${order.id}`, { method: 'PATCH', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ status: 'failed' }) });
  assert.equal(invalid.status, 409);
  const cancelled = await request(`/api/admin/orders/${order.id}`, { method: 'PATCH', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) });
  assert.equal(cancelled.status, 200);
  const cancelledData = await cancelled.json();
  assert.match(cancelledData.paymentMessage, /订单已取消/);
  assert.ok((await request('/api/admin/summary', { headers: { cookie } })).status === 200);
});
