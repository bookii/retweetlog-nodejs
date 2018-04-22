const getScript = (src) => {
    let s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    document.getElementsByTagName('body')[0].appendChild(s);
};

const myCreateElement = (elementType, attributes) => {
    let element = document.createElement(elementType);
    for (key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

const createReadMore = (screenName, maxId) => {
    let f = myCreateElement('form', {method:'post', id: 'readMore'});
    f.appendChild(myCreateElement('input', {type: 'hidden', name: 'screenName', value: screenName}))
    f.appendChild(myCreateElement('input', {type: 'hidden', name: 'maxId', value: maxId}));
    f.appendChild(myCreateElement('input', {type: 'hidden', name: 'reset', value: false}));
    let readMoreButton = myCreateElement('button', {class: "button is-info", type: 'submit'});
    readMoreButton.appendChild(document.createTextNode('READ MORE'));
    f.appendChild(readMoreButton);
    return f;
};

const loadRetweets = (form) => {
    const screenName = form.elements['screenName'].value;
    const reset = (form.elements['reset'].value == 'true');
    const maxId = parseInt(form.elements['maxId'].value);
    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },    
        body: JSON.stringify({
            screenName: screenName,
            maxIdPrev: maxId   // int or NaN
        })
    }).then((response) => {
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

        // read more button
        const maxId = json['maxId'];
        const readMoreNode = document.getElementById('readMore');
        if (readMoreNode) {
            readMoreNode.parentNode.removeChild(readMoreNode);
        }
        if (maxId) {
            form = createReadMore(screenName, maxId);
            document.getElementsByClassName('column')[0].appendChild(form);
            document.getElementById('readMore').addEventListener("submit", (event) => {
                event.preventDefault();
                loadRetweets(form);
            });
        }
    }).then(() => {
        getScript('https://platform.twitter.com/widgets.js');
    });
};

window.addEventListener('load', () => {
    const form = document.getElementById('readLatest');
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        loadRetweets(form);
    });
});