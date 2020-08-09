import './style.scss';

window.isSupportedBrowser = function(){
    var i = new Image();
    return "localStorage" in window
        && !!(Function.prototype&&Function.prototype.bind);
        // "requestAnimationFrame" in window
        // && "crossOrigin" in i
        // && "matchMedia" in window
};

window.addEventListener('load', function(){
    if (document.querySelectorAll) {
        var elems = document.querySelectorAll('.mail-decoder');
        var dec = function(){
            if (!this.dataset.decoded) {
                var plain = this.textContent.trim();
                plain = plain.replace(' at ', '@');
                plain = plain.replace(' dot ', '.');
                this.innerHTML = plain;
                this.href = 'mailto:'+plain;
                this.dataset.decoded = 1;
            }
        };
        for (var i = 0; i < elems.length; i++) {
            elems[i].addEventListener('mouseover', dec);
            elems[i].addEventListener('focus', dec);
            elems[i].addEventListener('click', dec);
        }
    }
});