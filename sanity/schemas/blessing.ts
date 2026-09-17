export default { name:'blessing', title:'Blessing', type:'document', fields:[
  {name:'title',type:'string',title:'Title'}, {name:'slug',type:'slug',title:'Slug',options:{source:'title'}}, {name:'pinyin',type:'string',title:'Pinyin'},
  {name:'literalMeaning',type:'object',title:'Literal meaning',fields:[{name:'zh',type:'string',title:'ZH'},{name:'en',type:'string',title:'EN'}]},
  {name:'culturalMeaning',type:'object',title:'Cultural meaning',fields:[{name:'zh',type:'text',title:'ZH'},{name:'en',type:'text',title:'EN'}]},
  {name:'scenarios',type:'array',title:'Scenarios',of:[{type:'string'}]}, {name:'cautions',type:'text',title:'Cautions'},
]};
