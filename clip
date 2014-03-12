(function(W,D){
  var gap = 125; 
  var stopIt=0;
  var paused=0;
  var sheet = (function() {
    var style = D.createElement("style");
    style.appendChild(D.createTextNode(""));
    D.head.appendChild(style);
    return style.sheet;
  })();
  sheet.addRule(".spreeCon","position:fixed;width:400px;height:100px;top:50%;left:50%;margin:-50px 0 0 -200px;z-index:9999;background:#fffefc;box-shadow:0 4px 6px -4px #666, 0 1px 2px 0 #666;text-align:left;font-size:36px;line-height:100px;font-family:Helvetica;font-weight:300",0);
  sheet.addRule(".spreeaftwrap","float:right;width:250px;display:inline-block;",1);
  sheet.addRule(".spreeaftwrap >span","float:left",2);
  sheet.addRule("#spreewpm","position:fixed;top:10px;right:10px;font-size:14px;font-family:Helvetica;background:#fffefc;padding:2px;box-shadow:0 1px 1px 0 #666;text-align:center;z-index:9999;color:#ffa500",3);

  function makeContainer(){
    var box = D.createElement('div');
    box.className="spreeCon";
    box.innerHTML="<div class='spreeaftwrap'><span style='color:#ffa500'>Spree...</span></div>";
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
  var wpm = 60000/gap;
  showWpm(wpm);
}

function showWpm(wpm){
  var tmp,node = D.getElementById("spreewpm")||
     (tmp=D.createElement('div'),tmp.id='spreewpm',D.body.appendChild(tmp));
  node.innerText=wpm.toString().slice(0,6)+" wpm"; 
}
  function spree(node,box){
    var words = node.innerText.split(/\s+/);
    var i=0;
    var len=words.length;
    var next = node.nextElementSibling||node.parentNode.nextElementSibling;
    (function addWord(){
      if(stopIt)return;
      if(paused){
        checkPause.func=addWord;
        return
      } 
      if(i<len){
        var word = words[i++];
        if(word.length) createText(word,box);
        setTimeout(addWord,gap);
      }else{
        if(next)
      setTimeout(function(){spree(next,box)});
      }
    })();
  }

  W.addEventListener("mousedown",function(e){
    var timeout=setTimeout(function(){
      stopIt=0;
      var box=makeContainer();
      showWpm(60000/gap);
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
})(window,document);

