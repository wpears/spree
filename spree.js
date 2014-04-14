(function(W,D){

  function main(){
    var i=0;
    var bd = D.body; 
    var gap = 100; 
    var stopIt=0;
    var empty = '';
    var leftovers=[];
    var innerHeight;
    var spreeSheet;
    var parentY=0;
    var toggleControls;
    var wpmDiv;
    var controls;
    var controlPane;
    var paused=0;
    var borderStyle;
    var globalNode;
    var cssText;
    var para=[]; 
    var pLength=0;
    var nodeIndex=0;
    var colors = ["#FFA500","#99793D","#FF6200","#40FFCE","#00FF76","#FFCF40","#1500FF","#773D99","#A000FF","#FF8700","#5E3D99","#444444","#00B5FF","#998B3D","#00F8FF","#FF0F26"];
    var colorIndex = 0;
    var pauseWord = " (code) "


    function setBorderStyle(node){
      var s = W.getComputedStyle(node)
        , pd = +s.paddingLeft.slice(0,-2)
        , brd = +s.borderLeft.split(" ")[0].slice(0,-2)
        , mrg = +s.marginLeft.slice(0,-2)
        ;
      borderStyle="padding-left:10px;border-left:3px solid "+colors[colorIndex]+";margin-left:"+(pd+brd+mrg-13)+"px;"
    }


    function createText(word,box){
      var pausing = word === pauseWord;
      var focus=word.length/3>>0;
      var pre = D.createElement('span');
      var foc = D.createElement('span');
      var aft = D.createElement('span');
      var wrap = D.createElement('div');

      pre.style.float="right";
      foc.style.color=colors[colorIndex];
      wrap.className='spreeaftwrap';

      if(pausing){
        foc.innerText = word;
      }else{
        pre.innerText=word.slice(0,focus);
        foc.innerText=word[focus];
        aft.innerText=word.slice(focus+1);
      }
      wrap.appendChild(foc);
      wrap.appendChild(aft);

      box.innerHTML='';

      box.appendChild(wrap);
      box.appendChild(pre);

      var center = foc.offsetWidth/-2;
      foc.style.marginLeft=center+"px";
      pre.style.marginRight=-center+"px";

      if(pausing) checkPause(0)
    }



    function checkPause(e){
      if(paused){
        paused=0;
        if(e)clearHighlight();
        checkPause.func();
      }else{
        paused = 1;
        if(e)highlight();
      }
    }
    checkPause.func=function(){};


    function setSpeed(code){
      var factor = gap/5;
      if(code===38)gap-=factor;
      else gap+=factor;
      if(gap<10)gap=10;
      var wpm = 60000/(gap+50);
      updateWpm(wpm);
    }


    function rewind(){
      i-=10;
      if (i<0)i=0;
    }


    function splitWord(word){
      var start =0;
      var end = 10;
      var newWord;
      var curr;
      for(var len=word.length;start<len;start+=10,end+=10){
        curr = word.slice(start,end);
        if(end<len) curr+="-"
          if(start===0)newWord = curr;
          else leftovers.push(curr)
      }
      return newWord
    }


    function showDyn(delay){
      showDyn.arr.push(delay);
      if (showDyn.arr.length === 50){
        var sum=0;
        for(var i=0;i<50;i++){
          sum+=showDyn.arr[i];
        }
        updateWpm(60000/(sum/50));
        showDyn.arr.length=0;   
      }
    }
    showDyn.arr=[];

    function addControls(){
      if(controls){
        controls.innerText="Controls \u25BE";
        bd.appendChild(controls)
        return controls;
      }
      var node = D.createElement('div');
      bd.appendChild(node);
      return node
    }
 
   function addPane(node, obj){
     if(node){
       bd.appendChild(node);
       return node;
     }
     var elem = D.createElement('div');
     for(var prop in obj){
       if(obj.hasOwnProperty(prop)){
         elem[prop] = obj[prop];
       }
     }
     bd.appendChild(elem);
     return elem;
   }
    
   toggleControls=function(){
     var showing = 0;
     return function (force){
      if(showing||force){
        controls.innerText = "Controls \u25BE";
        controlPane.style.cssText ="width:0;height:0;"
        showing = 0;
      }else{
        controls.innerText = "Controls \u25B4";
        controlPane.style.cssText = "width:200px;height:100px"
        showing = 1;
      }
     }
   }(); 
    
    function updateWpm(wpm){ 
      wpmDiv.innerText='~'+wpm.toString().slice(0,6)+" wpm"; 
    }


    function getYOffset(node,val){
      if (node === bd||node===null)return val;
      return getYOffset(node.offsetParent,val+node.offsetTop); 
    }
    

     function getXOffset(node,val){
      if (node === bd||node===null)return val;
      return getXOffset(node.offsetParent,val+node.offsetLeft); 
    }


    function highlight(){
      var textObj = para[nodeIndex];

      var words=textObj.words;
      var gaps = textObj.gaps;
      var node = textObj.node;
      if(!node) return;
      var parNode = node.parentNode; 

      var hlInd = i-1;
      var hlWord = textObj.words[hlInd];
      var firstPart = empty;
      var secondPart = empty
      for(var ind=0;ind<hlInd;ind++){
         firstPart+= gaps[ind]+words[ind];
      }
      firstPart+=gaps[hlInd]
      for(ind = hlInd+1;ind<gaps.length;ind++){
        var addition = gaps[ind];
        if (words[ind]) addition += words[ind]
        secondPart+=addition;
      }
      var firstNode=D.createTextNode(firstPart);
      var secondNode=D.createTextNode(secondPart);
      
      var hlNode=D.createElement('span');
      hlNode.className='spreeHL';
      hlNode.innerText=hlWord;
      parNode.insertBefore(firstNode,node);
      parNode.insertBefore(hlNode,node);
      parNode.insertBefore(secondNode,node);
      parNode.removeChild(node);

    }


    function clearHighlight(){
      var hlNode = D.getElementsByClassName("spreeHL")[0];
      if(!hlNode)return;
      var firstNode = hlNode.previousSibling;
      var secondNode = hlNode.nextSibling;
      var node = para[nodeIndex].node;
      var parNode = hlNode.parentNode; 

      parNode.insertBefore(node,firstNode);
      parNode.removeChild(firstNode);
      parNode.removeChild(hlNode);
      parNode.removeChild(secondNode);
    }


    function checkSkip(node){
      var tag = node.tagName;
      if(tag == "PRE")para.push({words:[pauseWord],gaps:["",""],node:node})
      if(tag=="IMG"||tag=="SCRIPT"||tag=="EMBED"||tag=="PRE"||tag=="VIDEO"||tag=="TABLE"||tag=="FORM"||tag=="FIGURE") return;
      var nodes = node.childNodes
        , len=nodes.length;
      if(len){ 
        for(var i=0;i<len;i++)
          checkSkip(nodes[i])
      }else{
        if(node.nodeType === 3){
          para.push(
              {words:node.nodeValue.split(/\s+/),
               gaps:node.nodeValue.split(/\S+/),
               node:node
              });
        }
      }
    } 


    function spree(node,box){
      var next = node.nextElementSibling;//||node.parentNode.nextElementSibling;
      checkSkip(node);
      if(!para.length){
        if(next) return setTimeout(function(){spree(next,box)});
        else return
      }
      pLength = para.length-1; 
      var words = para[nodeIndex].words;
      var len=words.length;
       
      i=0;
      globalNode = node;

      if(node.offsetTop+node.clientHeight+parentY >innerHeight+W.scrollY)
        W.scrollTo(0,node.offsetTop+parentY-50)

      cssText = node.style.cssText;
      node.style.cssText = borderStyle;

      (function addWord(){
        if(stopIt)return;
        if(paused){
          checkPause.func=addWord;
          return;
        } 
        if(nodeIndex<pLength||i<len||leftovers.length){
          var word;
          var offset=0;
          if(leftovers.length)
            word = leftovers.shift();
          else{
            if (i===len){
              words = para[++nodeIndex].words;
              len = words.length;
              i = 0;
            }
            word = words[i++];
          }
          
          if(word.length > 20)
            word = splitWord(word);

          if(word.length){
            createText(word,box);
            var first = word[0];
            var last = word[word.length-1];
            if(first===first.toUpperCase())offset += gap/1.5;
            if(last===','||last===';')offset+=gap/5;
            else if(last==='.'||last==='?'||last==='!')offset+=gap/2.5;
          }

          var delay=gap+offset+word.length*8;
          showDyn(delay);
          setTimeout(addWord,delay);
        }else{
          cleanup();
          if(next)
            setTimeout(function(){spree(next,box)});
        }
      })();
    }
    
    function cleanup(){
      globalNode.style.cssText=cssText;
      para.length = 0;
      nodeIndex = 0;
    }

    W.addEventListener("mousedown",function(e){
      var node = e.target;
      if(node.tagName !== "HTML"&&node.tagName!=="SELECT"&&(e.button===0||(document.all&&e.button===1))){
        var x = e.pageX;
        var y = e.pageY;
        var width = node.clientWidth;
        var height = node.clientHeight;
        if(!width){
          width = node.offsetWidth;
          height = node.offsetHeight;
        }
        var yOffset = getYOffset(node, 0);
        var xOffset = getXOffset(node, 0);
        if(x-xOffset > width||y-yOffset>height)return;

        var timeout=setTimeout(function(){
          stopIt=0;
          parentY = getYOffset(node.offsetParent, 0);
          setBorderStyle(e.target);
          innerHeight = W.innerHeight;
          var box=addPane(box,{
            id: "spreeCon",
            className: "spreeAtop",
            innerHTML: "<div class='spreeaftwrap'><span style='color:#ffa500;margin-left:-50px'>Spree...</span></div>"
          });
          controls = addPane(controls,{
            id:'spreeControls',
            className:'spreeAtop',
            innerText :"Controls \u25BE"
          });
          controlPane = addPane(controlPane,{
            id:'spreeControlPane',
            className:'spreeAtop'
          });
          wpmDiv = addPane(wpmDiv, {
            id:'spreewpm',
            className:'spreeAtop'
          });
          updateWpm(60000/(gap+50));
          setTimeout(function(){spree(e.target,box)},500);

          W.addEventListener("keydown",key);
          controls.addEventListener("mousedown",mouse);

          function stop(){
            stopIt=1;
            parentY=0;
            paused=0;
            clearHighlight();
            cleanup();
            toggleControls(1);
            bd.removeChild(box);
            bd.removeChild(wpmDiv);
            bd.removeChild(controls);
            bd.removeChild(controlPane);
            W.removeEventListener("keydown",key);
            controls.removeEventListener("mousedown",mouse);
          }

          function mouse(e){           
              toggleControls(0);
          }

          function key(e){
            e.preventDefault();
            var code = e.keyCode;
            if(code===38||code===40)return setSpeed(code);
            if(code===32)return checkPause(1);
            if(code===37)return rewind();
            stop();
          }
        },1000);

        var up = function(){
          clearTimeout(timeout);
          W.removeEventListener("mouseup",up);
          W.removeEventListener("mousemove",move)
        }

        var move = function(e){
          var xdiff=e.pageX-x;
          var ydiff=e.pageY-y;
          if(xdiff>10||xdiff<-10||ydiff>10||ydiff<-10){
            clearTimeout(timeout);
            W.removeEventListener("mousemove",move);
          }
        }
        W.addEventListener("mouseup",up);
        W.addEventListener("mousemove",move)
      }
    });

    spreeSheet = 
    (function() {
      var style = D.createElement("style");
      style.appendChild(D.createTextNode(""));
      D.head.appendChild(style);

      var sheet = style.sheet;
      sheet.addRule("#spreeCon","color:#444;width:600px;height:100px;top:50%;left:50%;margin:-50px 0 0 -300px;box-shadow:0 4px 6px -4px #666, 0 1px 2px 0 #666;text-align:left;font-size:36px;line-height:100px;font-weight:300",0);
      sheet.addRule(".spreeaftwrap","float:right;width:350px;line-height:100px;display:inline-block;background:#fffefc;",1);
      sheet.addRule(".spreeaftwrap >span","float:left,line-height:100px",2);
      sheet.addRule("#spreewpm","top:10px;left:10px;",3);
      sheet.addRule("#spreeControls","top:10px;right:10px;-webkit-touch-callout: none;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;",4);
      sheet.addRule('#spreeControls:hover','cursor:pointer',5)
      sheet.addRule(".spreeaftwrap>span:before",'content: "";border-left: 1px solid #666;height: 25px;position:absolute;left: 249px;',6)
      sheet.addRule(".spreeaftwrap>span:after",'content: "";border-left: 1px solid #666;height: 25px;position:absolute;left: 249px;bottom:0px;',7)
      sheet.addRule(".spreeHL","background-color:#FFC966;",8);
      sheet.insertRule("@media screen and (max-width : 600px){.spreeCon{margin:-50px 0 0 0; width:100%;left:0}.spreeaftwrap{width:60%;}.spreeaftwrap>span:before,.spreeaftwrap>span:after{left:39.4%;}}",9);
      sheet.addRule(".spreeCon >span","line-height:100px",10);
      sheet.addRule("#spreeControlPane","top:33px;right:10px;width:0;height:0;padding:0;box-shadow:0px 2px 1px -1px #666;-webkit-transition: height 0.1s ease-out,width 0.1s ease-out;-moz-transition: height 0.1s ease-out,width 0.1s ease-out;-o-transition: height 0.1s ease-out,width 0.1s ease-out;transition: height 0.1s ease-out,width 0.1s ease-out;",11);
      sheet.addRule(".spreeAtop","position:fixed;background:#fffefc;color:#ffa500;text-align:center;box-shadow:0 1px 1px 0 #666;z-index:9999;padding:2px 4px;width:auto;height:auto;font-size:14px;font-family:Helvetica;",12) 
      return sheet;
    })();
  }

  if(D.readyState === "loaded"||D.readyState === "complete") main();
  else W.addEventListener("DOMContentLoaded",main);
})(window,document);