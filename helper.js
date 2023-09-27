'use strict';

// Коллизия
export function checkCollision(array, obj) { // столкновения корабля или снаряда с астероидами, записанными в массив
    // if(obj.canRemove) {
    //     return;
    // }
    array.forEach(element => {
        if(element.coords.y + element.asteroidHeight < obj.coords.y || element.coords.y > obj.coords.y + obj.height){ // отсутствие коллизии по y
            return;
        }
        if(element.coords.x + element.asteroidWidth < obj.coords.x || element.coords.x > obj.coords.x + obj.width) {// отсутствие коллизии по x
            return;
        }
        element.collision = true;
        if(!element.canRemove) {
            obj.collision = true;
        }
    });
}

// рандомайзер
export function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}

// получение координат объекта
export function getCoords(item) {                            // Получение и возврат как числа координат по X и Y объекта
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

export function removeFromArray(array, height) { // удаление вышедших за экран или столкнувшихся астероидов и снарядов
    array.forEach((element,index) => {
        if(element.coords.y > height) {
            array.splice(index, 1);
        }
    });
}