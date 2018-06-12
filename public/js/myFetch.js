const checkStatus = (response) => {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
}

const getScript = (src) => {
    let s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = src;
    document.getElementsByTagName('body')[0].appendChild(s);
};

const createElementWithAttr = (elementType, attributes) => {
    let element = document.createElement(elementType);
    for (key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

const createReadMore = (screenName, maxId, csrfToken, includeSelf) => {
    let f = createElementWithAttr('form', {method:'post', id: 'readMore'});

    f.appendChild(createElementWithAttr('input', { type: 'hidden', name: 'screenName',  value: screenName  }));
    f.appendChild(createElementWithAttr('input', { type: 'hidden', name: 'maxId',       value: maxId       }));
    f.appendChild(createElementWithAttr('input', { type: 'hidden', name: 'untilDate',   value: null        }));
    f.appendChild(createElementWithAttr('input', { type: 'hidden', name: 'reset',       value: false       }));
    f.appendChild(createElementWithAttr('input', { type: 'hidden', name: 'includeSelf', value: includeSelf }));
    f.appendChild(createElementWithAttr('input', { type: 'hidden', name: '_csrf',       value: csrfToken   }));

    const readMoreButton = createElementWithAttr('button', {class: "button is-info", type: 'submit'});
    readMoreButton.appendChild(document.createTextNode('続きを読む'));
    f.appendChild(readMoreButton);

    return f;
};

const removeHero = () => {  // remove hero if exists
    const hero = document.getElementsByClassName('hero')[0];
    if (hero) {
        hero.parentNode.removeChild(hero);
    }
};

const loadRetweets = (form) => {
    form.getElementsByTagName('button')[0].classList.add('is-loading');     // add loading animation

    const screenName  = form.elements['screenName'].value;
    const maxId       = form.elements['maxId'].value;
    const untilDate   = form.elements['untilDate'].value;
    const includeSelf = form.elements['includeSelf'].value == 'true';      // string to boolean
    const csrfToken   = form.elements['_csrf'].value;
    const reset       = form.elements['reset'].value == 'true';
    const showCards   = form.elements['showCards'].value == 'true';

    fetch('/', {
        method: 'POST',
        credentials: 'same-origin',  // <-- includes cookies in the request (ref: https://github.com/expressjs/csurf)
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken
          },    
        body: JSON.stringify({
            screenName: screenName,
            maxId: maxId,   // int or NaN
            includeSelf: includeSelf,
            untilDate: untilDate,
            showCards: showCards
        })
    }).then((response) => {
        checkStatus(response);
        removeHero();
        form.getElementsByTagName('button')[0].classList.remove('is-loading');  // remove loading animation
        return response.json();
    }).then((json) => {
        // retweets
        if (reset) {
            document.getElementById('items').innerHTML = '';
        }
        json['items'].forEach((item) => {
            let a = document.createElement('div');
            a.innerHTML = item
            document.getElementById('items').appendChild(a);
        });

        // readmore button
        const maxId = json['maxId'];
        const readMoreNode = document.getElementById('readMore');
        if (readMoreNode) {  // delete button
            readMoreNode.parentNode.removeChild(readMoreNode);
        }
        if (maxId) {  // add button
            form = createReadMore(screenName, maxId, csrfToken, includeSelf);
            document.getElementsByClassName('contents')[0].appendChild(form);
            document.getElementById('readMore').addEventListener("submit", (event) => {
                event.preventDefault();
                loadRetweets(form);
            });
        }
    }).then(() => {
        getScript('https://platform.twitter.com/widgets.js');  // render
    });
};

window.addEventListener('load', () => {
    const form = document.getElementById('readLatest');
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        loadRetweets(form);
    });
});