window.onscroll = () => {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("jumpToTop").style.display = "block";
    } else {
        document.getElementById("jumpToTop").style.display = "none";
    }
}

const jumpToTop = () => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}