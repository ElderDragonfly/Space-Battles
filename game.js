'use strict';


// Выстраивание фона
const gameContainer = document.querySelector('.game-container'),     // Контейнер, содержащий все элементы страницы
      slides = document.querySelector('#slides'),                    // Контейнер со слайдами
      slidesImg = document.querySelectorAll('#slides img');          // Массив со слайдами

function draw(img, offsetY) {                                    // Функция смещает слайд на высоту самого слайда вверх
    img.style.transform = `translateY(${img.offsetHeight * offsetY - img.offsetHeight + gameContainer.offsetHeight}px)`;
}
slidesImg.forEach((element, item) => {                               // Применение ко всему массиву
    draw(element, -item);
});

// Анимация движения фона
let speed = 0.5;

function getCoords(item) {                            // Получение и возврат как числа координат по X и Y объекта
    const matrix = window.getComputedStyle(item).transform;
    const array = matrix.split(',');
    const coordY = array[array.length - 1];
    const coordX = array[array.length - 2];
    const numericY = parseFloat(coordY);
    const numericX = parseFloat(coordX);
    return {
        y: numericY,
        x: numericX
    };
}

function backgroundAnimation(element) {                         // Поднимает переданный элемент за видимое игровое поле, если он опустился за его высоту
    let newCoordBackground =  getCoords(element);               // Получение координаты Y элемента

    if (newCoordBackground.y > gameContainer.offsetHeight) {
        newCoordBackground.y = - element.height - gameContainer.offsetHeight;
    }

    element.style.transform = `translateY(${newCoordBackground.y + speed}px)`;
}

// Кнопка старт/пауза
const start = document.querySelector('.start'),
      stop = document.querySelector('.stop'),
      gameButtom = document.querySelector('#pause');


let isPause = true;
let animationId;    // Отвечает за остановку анимации фона

gameButtom.addEventListener('click', () => {

    if(isPause) {                                               // Запуск игры
        requestAnimationFrame(startGame);
        gameButtom.children[0].style.display = 'none';
        gameButtom.children[1].style.display = 'initial';
    } else {                                                    // Остановка игры движения фона
        cancelAnimationFrame(animationId);    
        cancelAnimationFrame(spaceshipInfo.moveToTopId);        // Отменяется анимация, если корабль УЖЕ был в движении при нажатии паузы
        cancelAnimationFrame(spaceshipInfo.moveToBottomId);
        cancelAnimationFrame(spaceshipInfo.moveToLeftId);
        cancelAnimationFrame(spaceshipInfo.moveToRightId);
        gameButtom.children[1].style.display = 'none';
        gameButtom.children[0].style.display = 'initial';
    }

    isPause = !isPause;
});

// Описание функции запускающей игру

function startGame() {
    slidesImg.forEach(element => {       // Анимация фона в основной функции
        backgroundAnimation(element);  
    });

    spaceshipEngineAnimation();    // Анимация огня из сопл корабля

    aster.asteroidMove();
    
    animationId = requestAnimationFrame(startGame);
}


// Космический корабль

const spaceshipImg = document.querySelectorAll('#spaceship img'); // Массив картинок в div`е космического корабля

spaceshipImg[0].style.display = 'block'; // Задаёт очевидные свойства дисплею изображению корабля,т.к. это проще чем в css
spaceshipImg[1].style.display = 'none';

let animationEngineId;                // Переменная через которую останавливается анимация сопл двигателя
let startEngine = Date.now();
function spaceshipEngineAnimation() {      // Меняет каждые 0.3 секунды изображения с кораблём для эффекта горения сопл

    let timePassed = Date.now() - startEngine;
    if (timePassed >= spaceshipInfo.speedEngine) {
        spaceshipImg.forEach(element => {
            if (element.style.display == 'none') {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
        startEngine = Date.now();
    }
}

const spaceship = document.querySelector('#spaceship'); // div космического корабля

const spaceshipCoords = getCoords(spaceship);
const spaceshipInfo = {                                 // Объект, из которого берутся параметры корабля
    moveToTopId: false,
    moveToBottomId: false,
    moveToLeftId: false,
    moveToRightId: false,

    speedEngine: 300,       // скорость прокрутки огня сопл
    spaceshipSpeed: 5,      // скорость перемещения корабля
};
function spaceshipMove(x, y) {         // Вспомогательная функция, перезаписывающая translate в div космического корабля
    spaceship.style.transform = `translate(${x}px, ${y}px)`;
}
function spaceshipMoveToTop() {        // Функция смещает translate на значение скорости и проверяет не выход за край
    let newCoordY = spaceshipCoords.y - spaceshipInfo.spaceshipSpeed;
    if(newCoordY >= 0) {
        spaceshipMove(spaceshipCoords.x, newCoordY);
        spaceshipCoords.y = newCoordY;

        spaceshipInfo.moveToTopId = requestAnimationFrame(spaceshipMoveToTop);
    }
}

// Движение космического корабля

function spaceshipMoveToBottom() {
    let newCoordY = spaceshipCoords.y + spaceshipInfo.spaceshipSpeed;
    if(newCoordY <= gameContainer.offsetHeight - spaceship.offsetHeight) {
        spaceshipMove(spaceshipCoords.x, newCoordY);
        spaceshipCoords.y = newCoordY;

        spaceshipInfo.moveToBottomId = requestAnimationFrame(spaceshipMoveToBottom);
    }
}
function spaceshipMoveToLeft() {
    let newCoordX = spaceshipCoords.x - spaceshipInfo.spaceshipSpeed;
    if(newCoordX >= 0) {
        spaceshipMove(newCoordX, spaceshipCoords.y);
        spaceshipCoords.x = newCoordX;

        spaceshipInfo.moveToLeftId = requestAnimationFrame(spaceshipMoveToLeft);
    }
}
function spaceshipMoveToRight() {
    let newCoordX = spaceshipCoords.x + spaceshipInfo.spaceshipSpeed;
    if(newCoordX <= gameContainer.offsetWidth - spaceship.offsetWidth) {
        spaceshipMove(newCoordX, spaceshipCoords.y);
        spaceshipCoords.x = newCoordX;

        spaceshipInfo.moveToRightId = requestAnimationFrame(spaceshipMoveToRight);
    }
}

document.addEventListener('keydown', (event) => { //Проверяет наличие анимации движения,если его нет-запускает её зацикленно
    if(isPause) {       // Если игра на паузе, выходим из события
        return;
    }

    if(spaceshipInfo.moveToTopId === false &&
       (event.code === "KeyW" || 
       event.code === "ArrowUp")) {
        spaceshipInfo.moveToTopId = requestAnimationFrame(spaceshipMoveToTop);
    }
    else if(spaceshipInfo.moveToBottomId === false && 
            (event.code === "KeyS" || 
            event.code === "ArrowDown")) {
                spaceshipInfo.moveToBottomId = requestAnimationFrame(spaceshipMoveToBottom);
    }
    else if(spaceshipInfo.moveToLeftId === false && 
            (event.code === "KeyA" || 
            event.code === "ArrowLeft")) {
                spaceshipInfo.moveToLeftId = requestAnimationFrame(spaceshipMoveToLeft);
    }
    else if(spaceshipInfo.moveToRightId === false && 
            (event.code === "KeyD" || 
            event.code === "ArrowRight")) {
                spaceshipInfo.moveToRightId = requestAnimationFrame(spaceshipMoveToRight);
    }
});
document.addEventListener('keyup', (event) => { // Отмена анимации при отпускании соответствующей клавиши
    if(event.code === "KeyW" || event.code === "ArrowUp") {
        cancelAnimationFrame(spaceshipInfo.moveToTopId);
        spaceshipInfo.moveToTopId = false;      // Перезаписывает переменную, говорящую есть ли анимация
    }
    if(event.code === "KeyS" || event.code === "ArrowDown") {
        cancelAnimationFrame(spaceshipInfo.moveToBottomId);
        spaceshipInfo.moveToBottomId = false;
    }
    if(event.code === "KeyA" || event.code === "ArrowLeft") {
        cancelAnimationFrame(spaceshipInfo.moveToLeftId);
        spaceshipInfo.moveToLeftId = false;
    }
    if(event.code === "KeyD" || event.code === "ArrowRight") {
        cancelAnimationFrame(spaceshipInfo.moveToRightId);
        spaceshipInfo.moveToRightId = false;
    }
});

// Астероиды

// рандомайзер
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}

let asteroidImgStorage = ['img/asteroids/asteroid_01.png',
                          'img/asteroids/asteroid_02.png', 
                          'img/asteroids/asteroid_03.png'];

// let small = 'small',
//     medium = 'medium',
//     large = 'large';

const asterodsCoordStorage = {

    // asteroidExistX: function(name, asteroidCoords, asteroidWidth) {
    //     for (const key in asteroidExistX) {
    //         if (asteroidExistX[key]) {
    //             asteroidExistX[name] = getRandomIntInclusive(0, gameContainer.clientWidth);
                
    //         }
    //     }
    // }
};

function Asteroid(size) {
    this.name = size;
    this.speed = null,
    this.asteroid = null,
    this.asteroidCoords = null,
    this.asteroidWidth = null,
    this.src = null,
    this.coordX  = getRandomIntInclusive(0, gameContainer.clientWidth),
    this.createAsteroid = function() { // Метод создаёт астероид
        switch(size) { // в зависимости от р-ра астероида переписывает параметры объекта
            case small:
                this.speed = 4;
                this.src = asteroidImgStorage[0];
                break;
            case medium:
                this.speed = 3;
                this.src = asteroidImgStorage[1];
                break;
            case large:
                this.speed = 2;
                this.src = asteroidImgStorage[2];
                break;
        }
        let asteroidDiv = document.createElement('div');                // создаётся div астероида
        asteroidDiv.classList.add('asteroid');
        gameContainer.append(asteroidDiv);

        let asteroidImg = document.createElement('img');                // создаётся изображение внутри
        asteroidImg.src = this.src;
        let asteroids = document.querySelectorAll('.asteroid');
        let lastAsteroid = asteroids[asteroids.length - 1];
        lastAsteroid.append(asteroidImg);
    
        asteroidDiv.style.transform = `translate(${this.coordX}px, -100%)`;

        this.asteroid = lastAsteroid;                   // меняются свойства элемента в зависимости от создаваемого р-ра
        this.asteroidCoords = getCoords(this.asteroid);
        // this.name = this.asteroidCoords.x;
        // asterodsCoordStorage[this.name] = this.asteroidCoords;
        // this.coordX = asterodsCoordStorage.asteroidExistX(getRandomIntInclusive(0, gameContainer.clientWidth), this.asteroidCoords);
        // this.asteroidWidth = this.asteroid.offsetWidth;
    },

    this.asteroidMove = function() {
        let newYCoord = this.asteroidCoords.y + this.speed;
        if(newYCoord > gameContainer.offsetHeight) {

            this.asteroid.remove();
            // delete asterodsCoordStorage[this.name];
        }
        this.asteroid.style.transform = `translate(${this.coordX}px, ${newYCoord}px)`;
        this.asteroidCoords.y = newYCoord;
    }
}


// попытка в новое
let small = {
    name: 'small',
    speed: 3,
    src: 'img/asteroids/asteroid_01.png',
};

let medium = {
    name: 'small',
    speed: 2,
    src: 'img/asteroids/asteroid_02.png',
};

let large = {
    name: 'small',
    speed: 1,
    src: 'img/asteroids/asteroid_03.png',
};

class AsteroidNew {
    constructor(obj) {
        this.name = null;
        this.speed = null;
        this.asteroid = null;
        this.asteroidCoords = null;
        this.asteroidWidth = null;
        this.src = null;
        this.coordX  = getRandomIntInclusive(0, gameContainer.clientWidth);
        Object.assign(this, obj);
    }

    createAsteroid() {
        let asteroidDiv = document.createElement('div');                // создаётся div астероида
        asteroidDiv.classList.add('asteroid');
        gameContainer.append(asteroidDiv);

        let asteroidImg = document.createElement('img');                // создаётся изображение внутри
        asteroidImg.src = this.src;
        let asteroids = document.querySelectorAll('.asteroid');
        let lastAsteroid = asteroids[asteroids.length - 1];
        lastAsteroid.append(asteroidImg);
    
        asteroidDiv.style.transform = `translate(${this.coordX}px, -100%)`;

        this.asteroid = lastAsteroid;                   // меняются свойства элемента в зависимости от создаваемого р-ра
        this.asteroidCoords = getCoords(this.asteroid);

        // this.name = this.asteroidCoords.x;
        // asterodsCoordStorage[this.name] = this.asteroidCoords;
        // this.coordX = asterodsCoordStorage.asteroidExistX(getRandomIntInclusive(0, gameContainer.clientWidth), this.asteroidCoords);
        // this.asteroidWidth = this.asteroid.offsetWidth;
    }

    asteroidMove() {
        let newYCoord = this.asteroidCoords.y + this.speed;
        if(newYCoord > gameContainer.offsetHeight) {

            this.asteroid.remove();
            // delete asterodsCoordStorage[this.name];
        }
        this.asteroid.style.transform = `translate(${this.coordX}px, ${newYCoord}px)`;
        this.asteroidCoords.y = newYCoord;
    }

}

const aster = new AsteroidNew(medium);
aster.createAsteroid();
console.log(aster);

// let smallAsteroid = new Asteroid(small);
// smallAsteroid.createAsteroid();
// console.log(smallAsteroid);

// let mediumAsteroid = new Asteroid(large);
// mediumAsteroid.createAsteroid();