(function(W,D){

  function main(){
    var i=0;
    var gap = 100; 
    var stopIt=0;
    var empty = '';
    var leftovers=[];
    var innerHeight;
    var parentY=0;
    var paused=0;
    var borderStyle="border-left:3px solid #ffa500;padding-left:10px;";
    var globalNode;
    var cssText;
    var para=[]; 
    var pLength=0;
    var nodeIndex=0;
    var pauseWord = " (code) "


    function makeContainer(){
      var box = D.createElement('div');
      box.className="spreeCon";
      box.innerHTML="<div class='spreeaftwrap'><span style='color:#ffa500;margin-left:-50px'>Spree...</span></div>";
      return D.body.appendChild(box);
    }


    function setBorderStyle(node){
      var s = W.getComputedStyle(node)
        , pd = +s.paddingLeft.slice(0,-2)
        , brd = +s.borderLeft.split(" ")[0].slice(0,-2)
        , mrg = +s.marginLeft.slice(0,-2)
        ;
      borderStyle+="margin-left:"+(pd+brd+mrg-13)+"px;"
    }


    function createText(word,box){
      var pausing = word === pauseWord;
      var focus=word.length/3>>0;
      var pre = D.createElement('span');
      var foc = D.createElement('span');
      var aft = D.createElement('span');
      var wrap = D.createElement('div');

      pre.style.float="right";
      foc.style.color="#ffa500";
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
      showWpm(wpm);
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
        showWpm(60000/(sum/50));
        showDyn.arr.length=0;   
      }
    }
    showDyn.arr=[];


    function showWpm(wpm){
      var tmp, node = D.getElementById("spreewpm")||
        ( tmp=D.createElement('div')
          , tmp.id='spreewpm'
          , D.body.appendChild(tmp)
        );
      node.innerText='~'+wpm.toString().slice(0,6)+" wpm"; 
    }


    function getYOffset(node,val){
      if (node === D.body)return val;
      return getYOffset(node.offsetParent,val+node.offsetTop); 
    }
    

     function getXOffset(node,val){
      if (node === D.body)return val;
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
          var box=makeContainer();
          showWpm(60000/(gap+50));
          setTimeout(function(){spree(e.target,box)},500);

          W.addEventListener("keydown",key);
          W.addEventListener("mousedown",stop);

          function stop(){
            stopIt=1;
            parentY=0;
            paused=0;
            clearHighlight();
            cleanup();
            D.body.removeChild(box);
            D.body.removeChild(D.getElementById("spreewpm"));
            W.removeEventListener("keydown",key);
            W.removeEventListener("mousedown",stop);
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
          var xdiff=e.clientX-x;
          var ydiff=e.clientY-y;
          if(xdiff>10||xdiff<-10||ydiff>10||ydiff<-10){
            clearTimeout(timeout);
            W.removeEventListener("mousemove",move);
          }
        }
        W.addEventListener("mouseup",up);
        W.addEventListener("mousemove",move)
      }
    });

    (function() {
      var style = D.createElement("style");
      style.appendChild(D.createTextNode(""));
      D.head.appendChild(style);

      var sheet = style.sheet;
      sheet.addRule(".spreeCon","position:fixed;color:#444;width:600px;height:100px;top:50%;left:50%;margin:-50px 0 0 -300px;z-index:9999;background:#fffefc;box-shadow:0 4px 6px -4px #666, 0 1px 2px 0 #666;text-align:left;font-size:36px;line-height:100px;font-family:Helvetica;font-weight:300",0);
      sheet.addRule(".spreeaftwrap","float:right;width:350px;line-height:100px;display:inline-block;background:#fffefc;",1);
      sheet.addRule(".spreeaftwrap >span","float:left,line-height:100px",2);
      sheet.addRule("#spreewpm","position:fixed;top:10px;right:10px;width:auto;:height:auto;font-size:14px;font-family:Helvetica;background:#fffefc;padding:2px;box-shadow:0 1px 1px 0 #666;text-align:center;z-index:9999;color:#ffa500",3);
      sheet.addRule(".spreeaftwrap>span:before",'content: "";border-left: 1px solid #666;height: 25px;position:absolute;left: 249px;',4)
      sheet.addRule(".spreeaftwrap>span:after",'content: "";border-left: 1px solid #666;height: 25px;position:absolute;left: 249px;bottom:0px;',5)
      sheet.addRule(".spreeHL","background-color:#FFC966;",6);
    sheet.insertRule("@media screen and (max-width : 600px){.spreeCon{margin:-50px 0 0 0; width:100%;left:0}.spreeaftwrap{width:60%;}.spreeaftwrap>span:before,.spreeaftwrap>span:after{left:39.4%;}}",7);
    sheet.addRule(".spreeCon >span","line-height:100px",8);
    })();
  }

  if(D.readyState === "loaded"||D.readyState === "complete") main();
  else W.addEventListener("DOMContentLoaded",main);
})(window,document);
