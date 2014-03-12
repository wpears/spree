(function(W,D){
  function main(){
  var gap = 100; 
  var stopIt=0;
  var innerHeight;
  var parentY;
  var paused=0;
  var orange="border-left:3px solid #ffa500; padding-left: 10px; margin-left:-13px";
  var sheet = (function() {
    var style = D.createElement("style");
    style.appendChild(D.createTextNode(""));
    D.head.appendChild(style);
    return style.sheet;
  })();
  sheet.addRule(".spreeCon","position:fixed;color:#444;width:600px;height:100px;top:50%;left:50%;margin:-50px 0 0 -300px;z-index:9999;background:#fffefc;box-shadow:0 4px 6px -4px #666, 0 1px 2px 0 #666;text-align:left;font-size:36px;line-height:100px;font-family:Helvetica;font-weight:300",0);
  sheet.addRule(".spreeaftwrap","float:right;width:350px;display:inline-block;background:#fffefc;",1);
  sheet.addRule(".spreeaftwrap >span","float:left",2);
  sheet.addRule("#spreewpm","position:fixed;top:10px;right:10px;font-size:14px;font-family:Helvetica;background:#fffefc;padding:2px;box-shadow:0 1px 1px 0 #666;text-align:center;z-index:9999;color:#ffa500",3);
  sheet.addRule(".spreeaftwrap>span:before",'content: "";border-left: 1px solid #666;height: 25px;position:absolute;left: 249px;',4)
  sheet.addRule(".spreeaftwrap>span:after",'content: "";border-left: 1px solid #666;height: 25px;position:absolute;left: 249px;bottom:0px;',5)
  sheet.insertRule("@media screen and (max-width : 600px){.spreeCon{margin:-50px 0 0 0; width:100%;left:0}.spreeaftwrap{width:60%;}.spreeaftwrap>span:before,.spreeaftwrap>span:after{left:39.4%;}}",6);
  function makeContainer(){
    var box = D.createElement('div');
    box.className="spreeCon";
    box.innerHTML="<div class='spreeaftwrap'><span style='color:#ffa500;margin-left:-50px'>Spree...</span></div>";
    return D.body.appendChild(box);
  }
  function createText(word,box){
    var focus=word.length/3>>0;
    var pre = D.createElement('span');
    var foc = D.createElement('span');
    var aft = D.createElement('span');
    var wrap = D.createElement('div');

    pre.style.float="right";
    foc.style.color="#ffa500";
    wrap.className='spreeaftwrap';

    pre.innerText=word.slice(0,focus);
    foc.innerText=word[focus];
    aft.innerText=word.slice(focus+1);
     
    wrap.appendChild(foc);
    wrap.appendChild(aft);

    box.innerHTML='';

    box.appendChild(wrap);
    box.appendChild(pre);
    
    var center = W.getComputedStyle(foc).width.slice(0,-2)/-2;
    foc.style.marginLeft=center+"px";
    pre.style.marginRight=-center+"px";
  }

function checkPause(){
    if(paused){
      paused=0;
      checkPause.func();
    }else
      paused = 1;
  }
checkPause.func=function(){};

function setSpeed(code){
  var factor = gap/5;
  if(code===38)gap-=factor;
  else gap+=factor;
  if(gap<40)gap=40;
  var wpm = 60000/(gap+50);
  showWpm(wpm);
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
var tmp,node = D.getElementById("spreewpm")||
     (tmp=D.createElement('div'),tmp.id='spreewpm',D.body.appendChild(tmp));
  node.innerText='~'+wpm.toString().slice(0,6)+" wpm"; 
}
  function spree(node,box){
    var words = node.innerText.split(/\s+/);
    var i=0;
    var len=words.length;
    var next = node.nextElementSibling;//||node.parentNode.nextElementSibling;

    if(node.offsetTop+node.clientHeight+parentY >innerHeight+W.scrollY)
      W.scrollTo(0,node.offsetTop+parentY-100)
    var cssText = node.style.cssText;
    node.style.cssText = orange;
    (function addWord(){
      if(stopIt){
        node.style.cssText=cssText;
        return;
      }
      if(paused){
        checkPause.func=addWord;
        return
      } 
      if(i<len){
        var word = words[i++];
        var offset=0;
        if(word.length){
          createText(word,box);
          var last = word[word.length-1];
          if(last===',')offset=gap/6;
          else if(last==='.')offset=gap/3;
        }
        var delay=gap+offset+word.length*8;
        showDyn(delay);
        setTimeout(addWord,delay);
      }else{
        node.style.cssText=cssText;
        if(next)
          setTimeout(function(){spree(next,box)});
      }
    })();
  }

  W.addEventListener("mousedown",function(e){
    var timeout=setTimeout(function(){
      stopIt=0;
      parentY = e.target.parentNode.offsetTop+50;
      innerHeight = W.innerHeight;
      var box=makeContainer();
      showWpm(60000/(gap+50));
      setTimeout(function(){spree(e.target,box)},500);
      W.addEventListener("keydown",key);
      W.addEventListener("mousedown",stop);

      function stop(){
        stopIt=1;
        D.body.removeChild(box);
        D.body.removeChild(D.getElementById("spreewpm"));
        W.removeEventListener("keydown",key);
        W.removeEventListener("mousedown",stop);
      }
      function key(e){
        e.preventDefault();
        var code = e.keyCode;
        if(code===38||code===40)return setSpeed(code);
        if(code===32)return checkPause();
        stop();
      }
    },1000);
    var up=W.addEventListener("mouseup",function(){
      clearTimeout(timeout);
      W.removeEventListener("mouseup",up);
    });
  });
}
if(D.readyState === "loaded"||D.readyState === "complete") main();
else W.addEventListener("DOMContentLoaded",main);
})(window,document);
