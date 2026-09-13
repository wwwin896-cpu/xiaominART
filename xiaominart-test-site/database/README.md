# 数据库交接说明

- 数据库文件：`data/xiaominart.sqlite`
- 引擎：Node.js 22 内置 `node:sqlite`
- 模式：WAL
- 建表参考：`schema.sql`
- 演示数据参考：`demo-data.json`
- 首次启动自动创建表并写入 F/L/S/X/C 五个演示 SKU。演示数据文件与运行时种子一致，不包含客户数据。
- 重置演示数据：停止测试站后，将 `data/xiaominart.sqlite`、`data/xiaominart.sqlite-wal`、`data/xiaominart.sqlite-shm` 移入回收站或删除后重启。不要对真实数据执行此操作。
- 当前版本未实现生产备份调度、迁移版本管理、数据库加密和多实例并发部署；正式上线前必须补齐。
