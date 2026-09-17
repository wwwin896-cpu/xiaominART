export default { name:'work', title:'Work', type:'document', fields:[
  {name:'title',type:'object',title:'Title',fields:[{name:'zh',type:'string',title:'ZH'},{name:'en',type:'string',title:'EN'}]},
  {name:'slug',type:'slug',title:'Slug',options:{source:'title.zh'}}, {name:'workCode',type:'string',title:'Work code'},
  {name:'status',type:'string',title:'Status',options:{list:['concept','sample','available','archived']}},
  {name:'deliveryType',type:'string',title:'Delivery type',options:{list:['original','reproduction','printed','digital','concept-only']}},
  {name:'summary',type:'object',title:'Summary',fields:[{name:'zh',type:'text',title:'ZH'},{name:'en',type:'text',title:'EN'}]},
  {name:'materials',type:'object',title:'Materials',fields:[{name:'zh',type:'text',title:'ZH'},{name:'en',type:'text',title:'EN'}]},
  {name:'dimensions',type:'object',title:'Dimensions',fields:[{name:'zh',type:'text',title:'ZH'},{name:'en',type:'text',title:'EN'}]},
  {name:'isConceptVisual',type:'boolean',title:'Concept visual'}, {name:'media',type:'array',title:'Media',of:[{type:'image'}]},
]};
