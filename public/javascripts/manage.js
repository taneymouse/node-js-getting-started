function showAnswer() {
    document.getElementById('show_answer').style.display = 'none';
    const result = document.getElementsByClassName('answer');
    Array.from(result).forEach((element) => (element.style.display = 'block'));
}
