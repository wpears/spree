var fs = require('fs');
var cheerio = require('cheerio');

module.exports = function(grunt){
	grunt.initConfig({
		uglify:{
			options:{
				mangle:true,
				compress:true
			},
			my_target:{
				files:{
					'./spree.min.js':['./spree.js']
				}
			}
		},
		watch:{
			files:['./spree.js'],
			tasks:['default']
		}
	})

	
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-gh-pages"); 

	grunt.registerTask('default',['uglify'])
  
  grunt.registerTask('makeIndex','Encode minified script and update index.html',
    function(grunt){
      var done = this.async();
      var $ = cheerio.load(fs.readFileSync('index.html'));
      var encoded = encodeURIComponent(fs.readFileSync('./spree.min.js'));
      $('a').eq(0).attr('href',"javascript:" + encoded);

      fs.writeFile('index.html',$.html(),function(err){
        if(err) return grunt.log.error("\nCouldn't write output html.\n");
        done(); 
      });

    });

  grunt.registerTask('pages',['uglify','makeIndex','gh-pages']);
};
