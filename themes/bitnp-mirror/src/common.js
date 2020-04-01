import './style.scss';

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