export default { name:'siteSettings', title:'Site Settings', type:'document', fields:[
  {name:'brandName',type:'string',title:'Brand name'}, {name:'brandNameZh',type:'string',title:'Brand name (ZH)'},
  {name:'writerPersona',type:'string',title:'Writer persona'}, {name:'primaryClaim',type:'object',title:'Primary claim',fields:[{name:'zh',type:'string',title:'ZH'},{name:'en',type:'string',title:'EN'}]},
  {name:'defaultSeo',type:'object',title:'Default SEO',fields:[{name:'title',type:'string',title:'Title'},{name:'description',type:'text',title:'Description'}]},
  {name:'disclaimer',type:'object',title:'Disclaimer',fields:[{name:'zh',type:'text',title:'ZH'},{name:'en',type:'text',title:'EN'}]},
]};
