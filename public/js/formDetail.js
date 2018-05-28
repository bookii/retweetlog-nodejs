const toggle = () => {
    const detail = document.getElementById('detail');
    const angle = document.getElementById('showDetail').getElementsByTagName('i')[0];

    if (detail.style.display === 'none') {
        detail.style.display = 'block';
        angle.classList.add('fa-angle-up');
        angle.classList.remove('fa-angle-down');
    } else {
        detail.style.display = 'none';
        angle.classList.add('fa-angle-down');
        angle.classList.remove('fa-angle-up');
    }
}

const dateOption = (checkbox) => {
    const untilDate = document.getElementById('untilDate');
    if (checkbox.checked === true) {
        untilDate.disabled = false;
    } else {
        untilDate.disabled = true;
    }
}

const fillToday = () => {
    if (!document.getElementById('untilDate').value) {
        const date = new Date();

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const yyyy = ('0000' + year).slice(-4);
        const mm = ('00' + month).slice(-2);
        const dd = ('00' + day).slice(-2);

        const ymd = yyyy + '-' + mm + '-' + dd;

        document.getElementById('untilDate').value = ymd;
    }
}

const adjustWidth = () => {
    const searchFieldElement = document.getElementById('simple').getElementsByClassName('control');
    const inputWidth = searchFieldElement[0].offsetWidth + searchFieldElement[1].offsetWidth;
    document.getElementById('untilDate').style.width = inputWidth + 'px';
}