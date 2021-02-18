
var files =require.context( './',true,/index.vue$/ );
var views={};
files.keys().forEach( filePath => {
        var key = filePath.match( /.*\/(.*)\/index.vue$/ )[1];
        views[key]=files(  filePath).default;
} )
console.log(views)
export default views;