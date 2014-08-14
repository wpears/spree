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


	grunt.registerTask('default',['uglify'])
};
