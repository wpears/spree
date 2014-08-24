(function(W,D){
  function main(){
    /**DOM Handles**/
    var body = D.body;
    var mainContainer;
    var globalNode;
    var controls;
    var controlPane;
    var wpmDiv;
    var colorSquares;


    /**Counts, indexes, offsets**/
    var wordCount=0;
    var gap = 100;
    var parentY=0;
    var colorIndex = 0;
    var textNodeIndex=0;


    /**Flags**/ 
    var active = 0;
    var paused=0;
    var stopSpree=0;


    /**Tracking Arrays**/ 
    var paragraph=[];
    var leftovers=[];


    /**Style shortcuts and global colors**/
    var containerText = "<div class='spreeaftwrap'><span class='spreeText' style='margin-left:-50px'>Spree...</span></div>";
    var borderStyle;
    var cssText;
    var colors = ["#FFA500","#99793D","#FF6200","#40FFCE","#00FF76","#FFCF40","#1500FF","#773D99","#A000FF","#FF8700","#5E3D99","#444444","#00B5FF","#998B3D","#00F8FF","#FF0F26"];
    var backgroundColors = ["#ffd530", "#c9a96d", "#ff9230", "#70fffe", "#30ffa6", "#ffff70", "#4530ff", "#a76dc9", "#d030ff", "#ffb730", "#8e6dc9", "#747474", "#30e5ff", "#c9bb6d", "#30ffff", "#ff3f56"];
    var pauseWord = " (code) ";


    /**Convenience**/ 
    var innerHeight;
    var indexOf = Array.prototype.indexOf;


    /**Get a function that manages UI state in its closure**/
    var toggleControls=function(){
      var showing = 0;
      var firstCall = 1;
      return function (force){
        if(firstCall){
          buildControlPane();
          firstCall = 0;
        }
        if(showing||force){
          controls.innerText = "Controls \u25BE";
          controlPane.style.cssText ="width:0;height:0;";
          showing = 0;
        }else{
          controls.innerText = "Controls \u25B4";
          controlPane.style.cssText = "width:140px;height:140px";
          showing = 1;
        }
      }
    }();


    /**Dynamically add styles. Allows full app to work as a bookmarklet**/ 
    /**without external requests. Ugly, but functional.**/
    var spreeSheet = (function() {
      var style = D.createElement("style");
      style.appendChild(D.createTextNode(""));
      D.head.appendChild(style);

      var sheet = style.sheet;
      sheet.addRule("#spreeCon","color:#444;width:600px;height:100px;top:50%;left:50%;margin:-50px 0 0 -300px;box-shadow:0 4px 6px -4px #666, 0 1px 2px 0 #666;text-align:left;font-size:36px;line-height:100px;font-weight:300;padding:0;",0);
      sheet.addRule(".spreeaftwrap","float:right;font-size:36px;border:0;width:350px;line-height:100px;display:inline-block;background:#fffefc;",1);
      sheet.addRule(".spreeaftwrap >span","float:left;line-height:100px;font-size:36px;",2);
      sheet.addRule("#spreewpm","top:10px;left:10px;",3);
      sheet.addRule("#spreeControls","top:10px;right:10px;-webkit-touch-callout: none;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;",4);
      sheet.addRule('#spreeControls:hover','cursor:pointer',5)
      sheet.addRule(".spreeaftwrap>span:before",'content: "";border-left: 2px solid transparent;border-right:2px solid transparent; border-top:25px solid #666;height: 0;width:0;position:absolute;left: 247px;',6)
      sheet.addRule(".spreeaftwrap>span:after",'content: "";border-left: 2px solid transparent;border-right:2px solid transparent; border-bottom:25px solid #666;height:0;width:0;position:absolute;left: 248px;bottom:0px;',7)
      sheet.addRule(".spreeHL","background-color:#ffd530;",8);
      sheet.insertRule("@media screen and (max-width : 600px){.spreeCon{margin:-50px 0 0 0; width:100%;left:0}.spreeaftwrap{width:60%;}.spreeaftwrap>span:before,.spreeaftwrap>span:after{left:39.4%;}}",9);
      sheet.addRule(".spreeCon >span","line-height:100px",10);
      sheet.addRule("#spreeControlPane","top:33px;right:10px;width:0;height:0;overflow:hidden;padding:0;box-shadow:0px 2px 1px -1px #666;-webkit-transition: height 0.1s ease-out,width 0.1s ease-out;-moz-transition: height 0.1s ease-out,width 0.1s ease-out;-o-transition: height 0.1s ease-out,width 0.1s ease-out;transition: height 0.1s ease-out,width 0.1s ease-out;",11);
      sheet.addRule(".spreeAtop","position:fixed;background:#fffefc;text-align:center;box-shadow:0 1px 1px 0 #666;z-index:591233;padding:2px 4px;width:auto;height:auto;font-size:14px;font-family:Helvetica;",12)
      sheet.addRule(".spreeColor","width:35px;height:35px;float:left;",13);
      sheet.addRule("#colorDiv","width:140px;height:140px;background:#fffefc;float:right;margin:0;padding:0;border:0;",14)
      sheet.addRule("#colorDiv:hover","cursor:pointer;",15);
      sheet.addRule(".spreeColor:active","opacity:0.7",16);
      sheet.addRule(".spreeText","color:#ffa500;",17);

      return sheet;
    })();


    /**If using the extension, pull in saved settings**/
    if(chrome&&chrome.storage){
      chrome.storage.sync.get(null,function(obj){
        if(obj.gap) gap = obj.gap;
        if(obj.colorIndex) colorIndex = obj.colorIndex;
      });
    }


    /**Added main listener, entry point into app**/
    W.addEventListener("mousedown",function(e){
      var node = e.target;
      var tag = node.tagName;

      /**Activate on alt-click, on sensible elements**/
      if( e.altKey === true &&
          active === 0  &&
          tag !== "HTML" &&
          tag !== "SELECT" &&
          tag !== "INPUT" &&
          tag !== "TEXTAREA" &&
          (e.button===0||(document.all&&e.button===1))
        ){
          stopSpree=0; 
          active=1;

          /**query window/node state**/
          parentY = getYOffset(node.offsetParent, 0);
          innerHeight = W.innerHeight;


          /**apply preferences before display**/
          setBorderStyle(node);
          setColor(colorIndex);


          /**initialize UI widgets on first activation, otherwise show them**/
          if(mainContainer){
            showPane(mainContainer);
            showPane(controls);
            showPane(controlPane);
            showPane(wpmDiv);
          }else{
            initializeUI();
          }


          /**show speed and kick off word display**/
          updateWpm(60000/(gap+50));
          setTimeout(function(){spree(node,mainContainer)},500);

           
          /**add listeners for ui and interrupts**/
          W.addEventListener("keydown",key);
          controls.addEventListener("mousedown",mouse);
        }
    });

   

    /**create each UI component, saving them in app-wide variables **/
    function initializeUI(){

      mainContainer = addPane({
        id: "spreeCon",
        className: "spreeAtop spreeText",
        innerHTML: containerText
      });


      controls = addPane({
        id:'spreeControls',
        className:'spreeAtop spreeText',
        innerText :"Controls \u25BE"
      });


      controlPane = addPane({
        id:'spreeControlPane',
        className:'spreeAtop spreeText'
      });


      wpmDiv = addPane({
        id:'spreewpm',
        className:'spreeAtop spreeText'
      });


      /**Convenience function for adding UI elements to the body**/
      function addPane(obj){
        var elem = D.createElement('div');

        for(var prop in obj){
          if(obj.hasOwnProperty(prop)){
            elem[prop] = obj[prop];
          }
        }

        body.appendChild(elem);
        return elem;
      } 
    } 



    /**reattach pre-generated nodes to the DOM**/
    function showPane(node){
      body.appendChild(node);
      return node;
    }



    /**Apply paragraph-focusing border. Color set to color choice.**/
    function setBorderStyle(node){
      var s = W.getComputedStyle(node)
        , pd = +s.paddingLeft.slice(0,-2)
        , brd = +s.borderLeft.split(" ")[0].slice(0,-2)
        , mrg = +s.marginLeft.slice(0,-2)
        ;
      borderStyle="margin-left:"+(pd+brd+mrg-13)+"px;padding-left:10px;border-left:3px solid "+colors[colorIndex]+";"
    } 



    /**Word display function. Heart of the functionality**/
    function spree(node,box){
      
      /**Walk the DOM for text nodes and store their values**/
      fillParagraph(node);

      var nextParagraph = node.nextElementSibling;
      
      /**Empty paragraph, move on or stop**/
      if(!paragraph.length){
        if(nextParagraph) return setTimeout(function(){spree(nextParagraph,box)});
        else return
      }
      
      var nodesInParagraph = paragraph.length-1;
      var words = paragraph[textNodeIndex].words;
      var nodeWordLength = words.length;

      /**Update globals**/
      wordCount=0;
      globalNode = node;
      cssText = node.style.cssText;
      node.style.cssText = borderStyle;
       
      /**Scroll page when an offpage node is reached**/
      if(node.offsetTop+node.clientHeight+parentY >innerHeight+W.scrollY){
        W.scrollTo(0,node.offsetTop+parentY-50);
      }


      /**Word display recursive loop**/
      (function addWord(){
        if(stopSpree)return;

        if(paused){
          /**pass closure to be called when unpaused**/
          togglePause.callback=addWord;
          return;
        }
       

        /**Get next word, from this node, next node or from a split word**/ 
        if(textNodeIndex < nodesInParagraph || wordCount < nodeWordLength || leftovers.length){
          var word;
          var offset=0;
          
          /**use leftover bits of previously split words first**/
          if(leftovers.length)
            word = leftovers.shift();
          else{
            if(wordCount === nodeWordLength){
              words = paragraph[++textNodeIndex].words;
              nodeWordLength = words.length;
              wordCount  = 0;
            }
            word = words[wordCount++];
          }

          if(word.length > 20)
            word = splitWord(word);

          /**Add word and set offset modifiers**/
          if(word.length){
            createText(word,box);
            var first = word[0];
            var last = word[word.length-1];
            if(first===first.toUpperCase())offset += gap/1.5;
            if(last===','||last===';')offset+=gap/5;
            else if(last==='.'||last==='?'||last==='!')offset+=gap/2.5;
          }
          
          /**Set delay until the next word's display and propagate to wpm calculation**/
          var delay=gap+offset+word.length*8;
          checkWpm(delay);
          setTimeout(addWord,delay);

        }else{
          /**Clean shared variables, break from addWord loop, and run spree on the next paragraph**/
          cleanup();
          if(nextParagraph)
            setTimeout(function(){spree(nextParagraph,box)},0);
        }
      })();
    }



    /**Process word for display, allows for focal letter**/
    function createText(word,box){
      var pausing = word === pauseWord;
      var focus=word.length/3>>0;
      var pre = D.createElement('span');
      var foc = D.createElement('span');
      var aft = D.createElement('span');
      var wrap = D.createElement('div');

      pre.style.float="right";
      foc.className = "spreeText";
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

      if(pausing) togglePause(0)
    }



    /**Pausing logic. Call the last set callback, which has node/text in its closure**/
    /**Call the in-page word highlighter if the user initiated the pause**/
    function togglePause(userPause){
      if(paused){
        paused=0;
        if(userPause)clearHighlight();
        togglePause.callback();
      }else{
        paused = 1;
        if(userPause)highlight();
      }
    }
    togglePause.callback=function(){};

    

    /**Split long words into multiple, hyphenated words**/
    /**Return the first, and process the remain bits before any new words**/
    function splitWord(word){
      var start =0
        , end = 10
        , len = word.length
        , newWord
        , subWord
        ;

      while(start < len){
        subWord = word.slice(start,end);

        if(end<len) subWord+="-"
         
        if(start===0)newWord = subWord;
        else leftovers.push(subWord)

        start+=10;
        end+=10
      }
      return newWord
    }

   

    /**Set speed on up/down, saving it if this is the extension**/ 
    function setSpeed(code){
      var factor = gap/5;

      if(code===38)gap-=factor;
      else gap+=factor;

      if(gap<10)gap=10;

      if(chrome&&chrome.storage){
        chrome.storage.sync.set({gap:gap})
      }

      var wpm = 60000/(gap+50);
      updateWpm(wpm);
    }



    /**Reflect new WPM in the UI**/
    function updateWpm(wpm){
      wpmDiv.innerText='~'+wpm.toString().slice(0,6)+" wpm";
    }



    /**On left arrow, move back ten words, or to the start of the paragraph**/
    function rewind(){
      wordCount-=10;
      if (wordCount < 0) wordCount = 0;
    }



    /**Every 50 words, update the wpm display with the average wpm for the block**/
    function checkWpm(delay){
      var wpmArr = checkWpm.arr;
      wpmArr.push(delay);

      if (wpmArr.length === 50){
        var sum=0;

        for(var i=0; i<50; i++){
          sum+=wpmArr[i];
        }

        updateWpm(60000/(sum/50));
        wpmArr.length=0;
      }
    }
    checkWpm.arr=[];
 


    /**Generate control pane from the list of colors and hook up listeners**/ 
    function buildControlPane(){
      var colorDiv = D.createElement('div');
      colorDiv.id = "colorDiv";

      colors.forEach(function(v){
        var node = D.createElement('div')
        node.className = "spreeColor";
        node.style.backgroundColor = v;
        colorDiv.appendChild(node);
      });

      controlPane.appendChild(colorDiv);
      colorSquares = colorDiv.children;

      controlPane.addEventListener("mouseover",mouseOverColorSet);
      controlPane.addEventListener("mousedown",mouseDownColorSet);
      controlPane.addEventListener("mouseout",mouseOutColorSet);
    }
    
   

    /**Get and set the color from the list at the same index as the target node**/   
    function mouseOverColorSet(e){
      setColor(indexOf.call(colorSquares,e.target))
    }



    /**Save the targeted color globally and remember it if in the extension**/
    function mouseDownColorSet(e){
      colorIndex = indexOf.call(colorSquares,e.target);
      if(chrome&&chrome.storage){
        chrome.storage.sync.set({colorIndex:colorIndex});
      }
    }



    /**If leaving the box of colors, reapply the saved color**/
    function mouseOutColorSet(e){
      if(!e.toElement||e.toElement.className !== "spreeColor"){
        setColor(colorIndex);
      }
    }    



    /**Apply color change to UI elements**/
    function setColor(index){
      if(index !== -1){
        var rules = spreeSheet.rules;
        rules[17].style.color = colors[index];
        rules[8].style.backgroundColor = backgroundColors[index];
        borderStyle = borderStyle.slice(0,-8) + colors[index] +';';
        if(globalNode)globalNode.style.cssText = borderStyle;
      }
    }

    


    function getYOffset(node,val){
      if (node === body||node===null)return val;
      return getYOffset(node.offsetParent,val+node.offsetTop);
    }


    function highlight(){
      var textObj = paragraph[textNodeIndex];
      if(!textObj) return;

      var words=textObj.words;
      var gaps = textObj.gaps;
      var node = textObj.node;
      if(!node) return;
      var parNode = node.parentNode;

      var hlInd = wordCount-1;
      var hlWord = textObj.words[hlInd];
      var firstPart = '';
      var secondPart = ''; 
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
      var node = paragraph[textNodeIndex].node;
      var parNode = hlNode.parentNode;

      parNode.insertBefore(node,firstNode);
      parNode.removeChild(firstNode);
      parNode.removeChild(hlNode);
      parNode.removeChild(secondNode);
    }



    /**recursively find text nodes and add them to the paragraph array**/ 
    function fillParagraph(node){
      var tag = node.tagName;

      if(tag == "PRE")paragraph.push({words:[pauseWord],gaps:["",""],node:node})
      
      if(tag=="IMG"||tag=="SCRIPT"||tag=="EMBED"||tag=="PRE"||tag=="VIDEO"||tag=="TABLE"||tag=="FORM"||tag=="FIGURE") return;
      
      var nodes = node.childNodes;
      var  len=nodes.length;
      
      if(len){
        for(var i=0; i<len; i++)
          fillParagraph(nodes[i])
      }else{
        if(node.nodeType === 3){
          paragraph.push({
            words:node.nodeValue.split(/\s+/),
            gaps:node.nodeValue.split(/\S+/),
            node:node
          });
        }
      }
    }


    
    

    function removeParagraphBorder(){
      if(globalNode) globalNode.style.cssText=cssText;
    }

    function setStartText(){
      mainContainer.innerHTML="<div class='spreeaftwrap'><span class='spreeText' style='margin-left:-50px'>Spree...</span></div>"
    }

    function cleanup(){
      removeParagraphBorder();
      globalNode = null;
      paragraph.length = 0;
      textNodeIndex = 0;     
    }

    function stop(){
      stopSpree=1;
      active = 0;
      parentY=0;
      paused=0;
      clearHighlight();
      cleanup();
      setStartText();
      toggleControls(1);
      body.removeChild(mainContainer);
      body.removeChild(wpmDiv);
      body.removeChild(controls);
      body.removeChild(controlPane);
      mainContainer.innerHTML = containerText;
      W.removeEventListener("keydown",key);
      controls.removeEventListener("mousedown",mouse);
    }

    function mouse(){
      toggleControls(0);
      W.addEventListener("mousedown",tog);
    }

    function tog(e){
      if(e.target !== controls&&e.target.className !== "spreeColor"){
        toggleControls(1);
        W.removeEventListener("mousedown",tog)
      }
    }

    function key(e){
      e.preventDefault();
      var code = e.keyCode;
      if(code===18) return;
      if(code===38||code===40)return setSpeed(code);
      if(code===32)return togglePause(1);
      if(code===37)return rewind();
      stop();
    }

  }
  
  /**Run main once the DOM has loaded**/
  if(D.readyState === "loaded"||D.readyState === "complete") main();
  else W.addEventListener("DOMContentLoaded",main);
})(window,document);
