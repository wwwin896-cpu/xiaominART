export default { name:'faqEntry', title:'FAQ entry', type:'document', fields:[
  {name:'question',type:'object',title:'Question',fields:[{name:'zh',type:'string',title:'ZH'},{name:'en',type:'string',title:'EN'}]},
  {name:'answer',type:'object',title:'Answer',fields:[{name:'zh',type:'text',title:'ZH'},{name:'en',type:'text',title:'EN'}]},
  {name:'category',type:'string',title:'Category'}, {name:'order',type:'number',title:'Order'}, {name:'published',type:'boolean',title:'Published'},
]};
