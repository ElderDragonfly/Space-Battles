'use strict';

window.addEventListener('keydown', (event) => {
    event.preventDefault();
});

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

function backgroundAnimation(element) {                         // Поднимает переданный элемент за видимое игровое поле,
                                                                // если он опустился за его высоту
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
        cancelAnimationFrame(spaceshipInfo.moveToTopId);    // Отменяется анимация,
        cancelAnimationFrame(spaceshipInfo.moveToBottomId); //если корабль УЖЕ был в движении при нажатии паузы
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

    spaceshipInfo.renderSpiceship();

    createAsteroids();
    asteroids.forEach(element => {
        element.asteroidMove();
    });
    asteroidRemove(asteroids);
    checkCollision(asteroids, spaceshipInfo);

    createMissles();
    missles.forEach(element => {
        element.move();
    });

    animationId = requestAnimationFrame(startGame);
}

// Космический корабль

const spaceshipImg = document.querySelector('#spaceship img'),
      spaceship = document.querySelector('#spaceship');


const spaceshipInfo = {        
    width: spaceship.offsetWidth,                         // Объект, из которого берутся параметры корабля
    height: spaceship.offsetHeight,

    coords: getCoords(spaceship),
    
    moveToTopId: false,
    moveToBottomId: false,
    moveToLeftId: false,
    moveToRightId: false,

    collision: false,

    startTimer: Date.now(),
    engineSpeed: 300,       // скорость прокрутки огня сопл
    explosionSpeed: 200,
    spaceshipSpeed: 2,      // скорость перемещения корабля

    currentImg: 'img/spaceships/spaceship_1.png',
    spiceshipAnimationSpeed: 0,

    engineImg: [
        'img/spaceships/spaceship_1.png',
        'img/spaceships/spaceship_2.png',
    ],
    explosionImg: [
        'img/SpaceshipExplosion/SpaceshipExplosion-1.png',
        'img/SpaceshipExplosion/SpaceshipExplosion-2.png',
        'img/SpaceshipExplosion/SpaceshipExplosion-3.png',
        'img/SpaceshipExplosion/SpaceshipExplosion-4.png',
        'img/SpaceshipExplosion/SpaceshipExplosion-5.png'
    ],
    explosionImgNumber: 0,

    renderSpiceship: function() {
        spaceshipImg.src = this.currentImg;
        let timePassed = Date.now() - this.startTimer;

        if(this.collision) {

            cancelAnimationFrame(animationId);    
            cancelAnimationFrame(spaceshipInfo.moveToTopId);    // Отменяется анимация,
            cancelAnimationFrame(spaceshipInfo.moveToBottomId); //если корабль УЖЕ был в движении при нажатии паузы
            cancelAnimationFrame(spaceshipInfo.moveToLeftId);
            cancelAnimationFrame(spaceshipInfo.moveToRightId);

            if (timePassed >= this.explosionSpeed) {
                if(this.explosionImgNumber >= this.explosionImg.length) {
                    setInterval(spaceshipImg.remove(), this.explosionSpeed);

                }   
                if(this.explosionImgNumber < this.explosionImg.length) {
                    this.currentImg = this.explosionImg[this.explosionImgNumber++];
                    this.startTimer = Date.now();
                }
            }
            return;
        }

        if (timePassed >= this.engineSpeed) {
            if(this.currentImg == this.engineImg[0]) {
                this.currentImg = this.engineImg[1];
            } else {
                this.currentImg = this.engineImg[0];
            }
            this.startTimer = Date.now();
        }
    },

};
spaceshipInfo.renderSpiceship();

// Движение космического корабля
function spaceshipMove(x, y) {         // Вспомогательная функция, перезаписывающая translate в div космического корабля
    spaceship.style.transform = `translate(${x}px, ${y}px)`;
}
function spaceshipMoveToTop() {        // Функция смещает translate на значение скорости и проверяет не выход за край
    let newCoordY = spaceshipInfo.coords.y - spaceshipInfo.spaceshipSpeed;
    if(newCoordY >= 0) {
        spaceshipMove(spaceshipInfo.coords.x, newCoordY);
        spaceshipInfo.coords.y = newCoordY;

        spaceshipInfo.moveToTopId = requestAnimationFrame(spaceshipMoveToTop);
    }
}
function spaceshipMoveToBottom() {
    let newCoordY = spaceshipInfo.coords.y + spaceshipInfo.spaceshipSpeed;
    if(newCoordY <= gameContainer.offsetHeight - spaceship.offsetHeight) {
        spaceshipMove(spaceshipInfo.coords.x, newCoordY);
        spaceshipInfo.coords.y = newCoordY;

        spaceshipInfo.moveToBottomId = requestAnimationFrame(spaceshipMoveToBottom);
    }
}
function spaceshipMoveToLeft() {
    let newCoordX = spaceshipInfo.coords.x - spaceshipInfo.spaceshipSpeed;
    if(newCoordX >= 0) {
        spaceshipMove(newCoordX, spaceshipInfo.coords.y);
        spaceshipInfo.coords.x = newCoordX;

        spaceshipInfo.moveToLeftId = requestAnimationFrame(spaceshipMoveToLeft);
    }
}
function spaceshipMoveToRight() {
    let newCoordX = spaceshipInfo.coords.x + spaceshipInfo.spaceshipSpeed;
    if(newCoordX <= gameContainer.offsetWidth - spaceship.offsetWidth) {
        spaceshipMove(newCoordX, spaceshipInfo.coords.y);
        spaceshipInfo.coords.x = newCoordX;

        spaceshipInfo.moveToRightId = requestAnimationFrame(spaceshipMoveToRight);
    }
}

document.addEventListener('keydown', (event) => { //Проверяет наличие анимации движения,
                                                  //если его нет-запускает её зацикленно
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

// объекты для создания классом новых экземпляров астероидов

let small = {
    name: 'small',
    asteroidWidth: 36,
    speed: 2,
    src: 'img/asteroids/asteroid_01.png',
};

let medium = {
    name: 'medium',
    asteroidWidth: 66,
    speed: 1.5,
    src: 'img/asteroids/asteroid_02.png',
};

let large = {
    name: 'large',
    asteroidWidth: 68,
    speed: 1,
    src: 'img/asteroids/asteroid_03.png',
};

let typeOfAsteroids = [small, medium, large];
let asteroids = [];

class AsteroidNew {
    constructor(obj) {
        this.name = null;
        // this.id = null;
        this.speed = null;
        this.asteroidDiv = null;
        this.asteroid = null;
        this.asteroidCoords = {};
        this.asteroidWidth = null;
        this.src = null;
        this.coordX  = this.checkAsteroidExist(asteroids);

        this.collision = false;
        this.stastTimer = Date.now();
        this.explosionSpeed = 200;
        this.explosionImg = [
            'img/asteroidExplosion/asteroidExplosion_01.png',
            'img/asteroidExplosion/asteroidExplosion_02.png',
            'img/asteroidExplosion/asteroidExplosion_03.png',
            'img/asteroidExplosion/asteroidExplosion_04.png',
            'img/asteroidExplosion/asteroidExplosion_05.png',
        ];
        this.explosionImgNumber = 0;
        Object.assign(this, obj); // разбивает полученный объект и присваевает параметры в созданный экземпляр класса
    }

    createAsteroid() {
        this.asteroidDiv = document.createElement('div');                // создаётся div астероида
        this.asteroidDiv.classList.add('asteroid');
        gameContainer.append(this.asteroidDiv);

        this.asteroid = new Image();                // создаётся изображение внутри
        this.asteroid.src = this.src;            
        this.asteroidDiv.append(this.asteroid);
        this.asteroidDiv.style.transform = `translate(${this.coordX}px, -100%)`;

        this.asteroidCoords = getCoords(this.asteroidDiv);// меняются свойства элемента в зависимости от создаваемого р-ра
    }

    checkAsteroidExist(array) {
        let x = getRandomIntInclusive(0, gameContainer.clientWidth);
    
        array.forEach(element => {
            if (element.asteroidCoords.x <= x <= element.asteroidCoords.x + element.asteroidWidth) {
                // this.checkAsteroidExist(array);
                // console.log('test');
            }
        });
        return x;
    }

    asteroidMove() {
        let newYCoord = this.asteroidCoords.y + this.speed;
        if(newYCoord > gameContainer.offsetHeight) {
            this.asteroid.remove();
        }
        this.asteroid.style.transform = `translate(${this.coordX}px, ${newYCoord}px)`;
        this.asteroidCoords.y = newYCoord;
    }

    asteroidExplosionAnimation() {
        if(this.collision) {
            // spaceshipImg.src = this.currentImg;
            let timePassed = Date.now() - this.startTimer;
    
            if(this.collision) {
    
                if (timePassed >= this.explosionSpeed) {
                    if(this.explosionImgNumber >= this.explosionImg.length) {
                        setInterval(this.remove(), this.explosionSpeed);
    
                    }   
                    if(this.explosionImgNumber < this.explosionImg.length) {
                        this.currentImg = this.explosionImg[this.explosionImgNumber++];
                        this.startTimer = Date.now();
                    }
                }
                return;
            }
        }
    }
}

let startCreateAsteroid = Date.now(); // создание астероида каждые intervalCreatAsteroid секунд
let intervalCreatAsteroid = 1000;
function createAsteroids() {
    let timePassed = Date.now() - startCreateAsteroid;

    if(timePassed > intervalCreatAsteroid) {
        let aster = new AsteroidNew(typeOfAsteroids[getRandomIntInclusive(0, typeOfAsteroids.length - 1)]);
        aster.createAsteroid();

        asteroids.push(aster);

        startCreateAsteroid = Date.now();
    }
}

function asteroidRemove(array) {
    array.forEach((element,index) => {
        if(element.asteroidCoords.y > gameContainer.offsetHeight) {
            array.splice(index, 1);
        }
    });
}

// Коллизия

function checkCollision(array, obj) {
    // array.forEach(element => {
    //     if (element.asteroidCoords.y + element.asteroidWidth > spaceshipInfo.coords.y &&
    //         element.asteroidCoords.y < spaceshipInfo.coords.y + spaceship.offsetWidth &&
    //         element.asteroidCoords.x < spaceshipInfo.coords.x + spaceship.offsetWidth && 
    //         element.asteroidCoords.x + element.asteroidWidth > spaceshipInfo.coords.x) {
    //             spaceshipInfo.collision = true;
    //     } 
    // });

    array.forEach(element => {
        if (element.asteroidCoords.y + element.asteroidWidth > obj.coords.y &&
            element.asteroidCoords.y < obj.coords.y + obj.width &&
            element.asteroidCoords.x < obj.coords.x + obj.width && 
            element.asteroidCoords.x + element.asteroidWidth > obj.coords.x) {
                obj.collision = true;
                element.asteroid.remove();
        } 
    });
}

// создание снаряда

const missleStandart = {
    speed: 2,
    height: 34,
    width: 16,
    misslesImg: [
        'img/shots/standart_shots/shot_01.png',
        'img/shots/standart_shots/shot_02.png',
        'img/shots/standart_shots/shot_03.png',
        'img/shots/standart_shots/shot_04.png',
    ],
};

class MissleNew {
    constructor(obj) {
        this.speed = null;
        this.height = null;
        this.width = null;
        this.missleDiv = null;
        this.missle = null;
        this.coords = {};
        this.misslesImg = [];
        this.misslesImgNumber = 0;
        this.startAnimationMissle = Date.now();
        this.animationMissleInterval = 55;
        this.collision = false;
        Object.assign(this, obj);
    }

    createNewMissle() {
        this.missleDiv = document.createElement('div');                // создаётся div снаряда
        this.missleDiv.classList.add('missleContainer');
        gameContainer.append(this.missleDiv);
    
        this.missle = new Image();
        this.missle.src = this.misslesImg[this.misslesImgNumber];
        this.missleDiv.append(this.missle);
        this.missleDiv.style.transform = `translate(${spaceshipInfo.coords.x + spaceship.offsetWidth / 2 - this.width / 2}px, ${spaceshipInfo.coords.y - this.height}px)`;

        this.coords = getCoords(this.missleDiv);
    }

    move() {
        let newYCoord = this.coords.y - this.speed;
        if(newYCoord < 0) {
            this.missle.remove();
        }
        this.missleDiv.style.transform = `translate(${this.coords.x}px, ${newYCoord}px)`;
        this.coords.y = newYCoord;

        this.animationMissles();
        checkCollision(asteroids, this);
        this.collisionMissleAsteroid();
    }

    animationMissles() {
        let timePassed = Date.now() - this.startAnimationMissle;
        if(timePassed > this.animationMissleInterval) {
            if(this.misslesImgNumber < this.misslesImg.length) {
                this.missle.src = this.misslesImg[this.misslesImgNumber];
                this.misslesImgNumber++;
                if(this.misslesImgNumber == this.misslesImg.length) {
                    this.misslesImgNumber = 0;
                }
            }
            this.startAnimationMissle = Date.now();
        }
    }

    collisionMissleAsteroid() {
        if(this.collision) {
            this.missleDiv.remove();
        }
    }

}

const missles = [];
let startCreateMissles = Date.now();
let intervalCreatMissles = 700;
let fireCheck = false;
function createMissles() {
    let timePassed = Date.now() - startCreateMissles;
    if(timePassed > intervalCreatAsteroid && fireCheck) {
        const missle = new MissleNew(missleStandart);
        missle.createNewMissle();
        missles.push(missle);
        startCreateMissles = Date.now();
    }
}
document.addEventListener('keydown', (event) => {
    if(event.code == 'Space' && spaceshipInfo.collision == false) {
        fireCheck = true;
    }
});
document.addEventListener('keyup', (event) => {
    if(event.code == 'Space') {
        fireCheck = false;
    }
});
