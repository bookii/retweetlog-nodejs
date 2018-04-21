const getScript = (src) => {
    let s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    document.getElementsByTagName('body')[0].appendChild(s);
};

const loadRetweets = (form) => {
    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },    
        body: JSON.stringify({
            screen_name: form.elements['screenName'].value
        })
    }).then((response) => {
        return response.json();
    }).then((json) => {
        document.getElementById('items').innerHTML = '';
        json['items'].forEach((item) => {
            let a = document.createElement('div');
            a.innerHTML = item
            document.getElementById('items').appendChild(a);
        });
    }).then(() => {
        getScript('https://platform.twitter.com/widgets.js');
        console.log('Finished!');
    });
};

window.addEventListener('load', () => {
    const form = document.getElementById('readLatest');
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        loadRetweets(form);
    });
});