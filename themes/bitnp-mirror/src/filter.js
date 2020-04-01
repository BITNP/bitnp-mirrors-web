window.addEventListener('load', function(){
    if (document.getElementsByTagName('main')[0].classList.contains('page-index')) {
        // press f to find like GitHub
        // Thanks to USTC
        var filterInput = document.getElementById('filter-list');
        var keyboardHelpDiv = document.getElementById('keyboard-help');
        var keyboardHelpClose = document.getElementById('keyboard-help-close');
        var preventKeypressFlag = 0;
        var keypressCounter = 0;
        keyboardHelpDiv.addEventListener('keydown', function(event) {
            if (event.keyCode == 27) {
                // Esc
                keyboardHelpDiv.classList.add('d-none');
                localStorage.keyboardHelpIndex = 1;
            }
        });
        keyboardHelpDiv.addEventListener('click', function(event) {
            keyboardHelpDiv.classList.add('d-none');
            localStorage.keyboardHelpIndex = 1;
        });
        document.body.addEventListener('keydown', function(event) {
            if (preventKeypressFlag){
                event.preventDefault();
                return false;
            }
            if (document.activeElement.tagName === 'INPUT') {
                return;
            }
            if (keypressCounter >= 0){
                keypressCounter++;
                // threshold to trigger keyboard help
                if (keypressCounter > 3) {
                    keypressCounter = -1;
                    if (!localStorage.keyboardHelpIndex) {
                        keyboardHelpDiv.classList.remove('d-none');
                        // don't focus, or we cannot (or I don't want to) revert focus state
                    }
                }
            }
            if (event.ctrlKey || event.altKey){
                // NOP
            }else{
                if (!keyboardHelpDiv.classList.contains('d-none') && event.keyCode == 27) {
                    // Esc keyboard help
                    keyboardHelpDiv.classList.add('d-none');
                    localStorage.keyboardHelpIndex = 1;
                }
                if (event.keyCode == 191 && event.shiftKey){
                    // show keyboard help
                    keyboardHelpDiv.classList.remove('d-none');
                    keyboardHelpClose.focus();
                }
                if (event.keyCode == 70 || (event.keyCode == 51 && event.shiftKey)) {
                    keypressCounter = -2;
                    if (filterInput.scrollIntoViewIfNeeded)
                        filterInput.scrollIntoViewIfNeeded();
                    else if (filterInput.scrollIntoView)
                        filterInput.scrollIntoView();
                    filterInput.focus();
                    preventKeypressFlag = 1;
                    document.addEventListener('keyup', removeKeypressFlag);

                    if (event.keyCode == 70) {
                        event.preventDefault();
                    }

                    if (event.keyCode == 51 && event.shiftKey) {
                        filterInput.value = '';
                        // filterInputEvent.call(filterInput);
                        // we will let default behavior type # in input, and input event triggered there
                    }
                }
            }
        });

        var removeKeypressFlag = function(){
            preventKeypressFlag = 0;
            document.removeEventListener('keyup', removeKeypressFlag);
        };

        var cols;
        var titles;
        var cols_cache = [];
        var titles_cache = [];
        function filter_reset(){
            // fetch status
            var statusJSON = document.getElementById('filter-list-group').dataset.statusJson;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', statusJSON+'?refresh='+encodeURIComponent(+new Date()), true);
            xhr.onload = function() {
                var cols_mapping = {};
                var data = JSON.parse(this.responseText);
                for (var i in data) {
                    cols_mapping[data[i].name] = data[i].status;
                }
                filter_reset_continue(cols_mapping);
            };
            xhr.onerror = function () {
                console.error(this.status);
                filter_reset_continue({});
            };
            xhr.send();
        }

        var statusLabel = {
            "none": "未同步",
            "failed": "同步失败",
            "syncing": "正在同步",
            "pre-syncing": "正在预同步",
            "paused": "同步暂停",
            "disabled": "同步禁用",
        };

        function titles_click(event){
            var oldValue = filterInput.value;
            var newValue = '';
            // make back button usable - save current keyword
            history.replaceState({"filter": oldValue}, document.title);

            // we want to modify current filterInput value correctly
            // by replacing the tag
            oldValue.split(" ").forEach(function(w){
                if(w.startsWith("#")){

                }else{
                    newValue += " "+w;
                }
            });

            newValue = this.getAttribute('href')+newValue;

            // event.preventDefault();
            filterInput.value = newValue;
            // extra space for more search terms
            filterInputEvent.call(filterInput);

            // eventually when it's clicked a new state is generated
        }

        // make back button usable
        window.addEventListener('popstate', function(event){
            this.console.log(event);
            if (event.state && event.state.filter !== undefined) {
                filterInput.value = event.state.filter;
                filterInputEvent.call(filterInput);
            }
        });

        function filter_reset_continue(cols_mapping) {
            cols = document.getElementsByClassName('mirror-col');
            titles = document.getElementsByClassName('mirrors-title');
            cols_cache = [];
            titles_cache = [];

            for (var i = 0; i < titles.length; i++) {
                titles_cache[i] = {
                    textContent: titles[i].textContent.toLowerCase(),
                    elem: titles[i],
                    shown: 1,
                    a_elem: titles[i].getElementsByTagName('a')[0],
                };
                titles[i].classList.remove('d-none');
                if (!titles[i].dataset.i){
                    // set onclick - only do this once
                    var title_a = titles[i].getElementsByTagName('a')[0];
                    if(title_a) title_a.addEventListener('click', titles_click);
                }
                titles[i].dataset.i = i;
            }

            for (var i = 0; i < cols.length; i++) {
                cols_cache[i] = {
                    textContent: cols[i].textContent.toLowerCase(),
                    elem: cols[i],
                    shown: 1,
                    titles_i: -1,
                };
                cols[i].classList.remove('d-none');

                // trigger status
                var status = cols_mapping[cols[i].dataset.slug];
                if (status && status != 'success') {
                    if (statusLabel[status]) {
                        status = statusLabel[status];
                    }
                    var badge = cols[i].getElementsByClassName('badge-sync-status')[0];
                    badge.classList.remove('d-none');
                    badge.innerHTML = status;
                }

                var title_elem = cols[i].parentElement.previousElementSibling;
                if (title_elem && title_elem.classList.contains('mirrors-title')) {
                    cols_cache[i].titles_i = +title_elem.dataset.i;
                } else {
                    console.error(title_elem);
                }
            }

            filterInputEvent.call(filterInput);

            // bind aside link event
            var aside_titles = document.getElementsByClassName('aside-mirrors-title');
            for (var i = 0; i < aside_titles.length; i++) {
                if (!aside_titles[i].dataset.binded){
                    // set onclick - only do this once
                    var title_a = aside_titles[i].getElementsByTagName('a')[0];
                    if(title_a) title_a.addEventListener('click', titles_click);

                    aside_titles[i].dataset.binded = 1;
                }
            }
        }
        filter_reset();

        function updateVDOM(hit, cache_item) {
            if (hit != cache_item.shown) {
                cache_item.shown = hit; // virtual DOM
                cache_item.elem.classList[
                    hit ?
                    'remove':
                    'add'
                ]('d-none');
            }
        }

        var notfound = document.getElementById('filter-notfound');
        var notfound_a = notfound.getElementsByTagName('a')[0];
        function filterInputEvent(){
            var word = '';
            var hashtag = '';
            var titles_count = [];
            var found = 0;
            this.value.trim().toLowerCase().split(' ').forEach(function(v, i){
                if ((v+"").startsWith("#")) {
                    if (!hashtag){
                        hashtag = v.substring(1);
                    }
                }else{
                    word += v+" ";
                }
            });
            word = word.trim();

            // filter categories first to eliminate some work
            for (var i = 0; i < titles_cache.length; i++) {
                var hit = 1;
                if (hashtag) {
                    hit = titles_cache[i].textContent.indexOf(hashtag) >= 0;
                }
                updateVDOM(hit, titles_cache[i]);
                titles_count[i] = 0;
            }

            // filter items
            for (var i = 0; i < cols_cache.length; i++) {
                var hit;
                if (!titles_cache[cols_cache[i].titles_i].shown) {
                    hit = 0;
                } else {
                    hit = !word || cols_cache[i].textContent.indexOf(word) >= 0;
                }

                if (hit) {
                    titles_count[cols_cache[i].titles_i]++;
                    found++;
                }

                updateVDOM(hit, cols_cache[i]);
            }

            for (var i = 0; i < titles_count.length; i++) {
                // filter titles again to hide empty titles
                if (titles_count[i] == 0) {
                    updateVDOM(0, titles_cache[i]);
                }

                // set title tabindex for ally fine-tune
                var a = titles_cache[i].a_elem;
                if (word) {
                    a.setAttribute('tabindex', -1);
                } else {
                    a.removeAttribute('tabindex');
                }
            }

            // show not found message
            notfound.classList[
                found ? 'remove' : 'add'
            ]('my-5');

            if (notfound_a) {
                if (!notfound_a.dataset.href) {
                    notfound_a.dataset.href = notfound_a.href;
                }
                notfound_a.href = notfound_a.dataset.href+encodeURIComponent(" "+word);
            }
        }

        filterInput.addEventListener('input', filterInputEvent);
    }
});