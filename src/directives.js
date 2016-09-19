angular.module('dragAndDropApp')
    .directive('multipleResponsive', function () {
        return {
            restrict: 'E',
            link: function ($scope, elm, attr) {
                var elem = elm[0];
                [].forEach.call(elem.querySelectorAll('[type = "checkbox"]'), function (item) {
                    item.onclick = function () {
                        var arr = [];
                        console.log(item);
                        [].forEach.call(elem.querySelectorAll('[type = "checkbox"]'), function (check) {
                            if (check.checked) {
                                arr.push(check.value);
                                elem.setAttribute('user-answer', arr.toString());
                            }
                        })

                    }
                })
            }
        }
    })
    .directive('multipleChoice', function () {
        return {
            restrict: 'E',
            link: function ($scope, elm, attr) {

                var item = elm[0];

                [].forEach.call(item.querySelectorAll('[type = "radio"]'), function (elm) {
                    elm.onclick = function () {
                        item.setAttribute('user-answer', elm.value);
                        var userAns = item.getAttribute('user-answer');
                    }
                });
            }
        }
    })
    .directive('draganddropContainer', function () {
        return {
            restrict: 'E',
            link: function ($scope, elm, attr) {
                var that, pos_y, pos_x, initial = [], container, dropZoneLocations = [], answersObj = {};
                Array.prototype.slice.call(elm).forEach(function (_this, _index, _arr) {
                    [].forEach.call(_this.querySelectorAll('[drag-item]'), function (dragItem, dragItemIndex, dragItemArr) {
                        dragItem.style.position = 'absolute';
                        dragItem.draggable = false;
                        dragItem.style.cursor = 'pointer';
                        var coords = {
                            item: dragItem.getAttribute('drag-item'),
                            x: dragItem.offsetLeft,
                            y: dragItem.offsetTop
                        }
                        initial.push(coords);

                        //mouse events
                        dragItem.addEventListener('mousedown', dragStart);
                        document.addEventListener('mousemove', drag);
                        document.addEventListener('mouseup', dragend);

                        //touch events
                        dragItem.addEventListener('touchstart', dragStart);
                        document.addEventListener('touchmove', drag);
                        document.addEventListener('touchend', dragend);
                    });
                    [].forEach.call(_this.querySelectorAll('[drop-zone]'), function (dropZone, dropZoneIndex, dropZoneArr) {
                        var coords = {
                            zone: parseInt(dropZone.getAttribute('drop-zone')),
                            x: dropZone.offsetLeft,
                            y: dropZone.offsetTop,
                            x1: dropZone.offsetLeft + dropZone.offsetWidth,
                            y1: dropZone.offsetTop + dropZone.offsetHeight,
                            centerX: dropZone.offsetLeft + (dropZone.offsetWidth / 2),
                            centerY: dropZone.offsetTop + (dropZone.offsetHeight / 2)
                        }
                        answersObj[dropZone.getAttribute('drop-zone')] = '(na)';
                        dropZoneLocations.push(coords);
                    });
                });
                function dragStart(e) {
                    that = e.currentTarget;
                    container = that.parentElement;
                    var loop = setInterval(function () {
                        if (container.nodeName !== 'DRAGANDDROP-CONTAINER') {
                            container = container.parentElement;
                        } else {
                            clearInterval(loop);
                        }
                    }, 1);
                    if (that.className.indexOf('transition') >= 0) {
                        that.className = that.className.replace(' transition', '');
                    }
                    that.style.zIndex = 1000;
                    pos_x = document.all ? window.event.clientX : e.pageX;
                    pos_y = document.all ? window.event.clientY : e.pageY;
                    that.style.left = pos_x - (that.offsetWidth / 2) + 'px';
                    that.style.top = pos_y - (that.offsetHeight / 2) + 'px';
                }
                function drag(e) {
                    if (that) {
                        if (e.type == 'touchmove') {
                            pos_x = e.changedTouches[0].pageX;
                            pos_y = e.changedTouches[0].pageY;
                        } else {
                            pos_x = document.all ? window.event.clientX : e.pageX;
                            pos_y = document.all ? window.event.clientY : e.pageY;
                        }
                        that.style.left = pos_x - (that.offsetWidth / 2) + 'px';
                        that.style.top = pos_y - (that.offsetHeight / 2) + 'px';
                    }
                }
                function dragend() {
                    if (that) {
                        var thatCords = {
                            item: that.getAttribute('drag-item'),
                            x: that.offsetLeft,
                            y: that.offsetTop,
                            x1: that.offsetLeft + that.offsetWidth,
                            y1: that.offsetTop + that.offsetHeight
                        };
                        that.className += ' transition';
                        that.style.zIndex = "";
                        dropZoneLocations.some(function (obj, objIndex, objArr) {
                            if ((obj.x <= thatCords.x && obj.x1 >= thatCords.x || obj.x1 >= thatCords.x && obj.x <= thatCords.x1) && (obj.y <= thatCords.y && obj.y1 >= thatCords.y || obj.y1 >= thatCords.y && obj.y <= thatCords.y1)) {
                                that.style.left = obj.centerX - (that.offsetWidth / 2) + 'px';
                                that.style.top = obj.centerY - (that.offsetHeight / 2) + 'px';
                                if (container.getAttribute('user-answer') !== null) {
                                    var userAns = JSON.parse(container.getAttribute('user-answer'));
                                    if (userAns[obj.zone] !== '(na)') {
                                        var simon = document.querySelector('[drag-item="' + userAns[obj.zone] + '"]');
                                        var simonInitial = initial.filter(function (item) {
                                            if (simon.getAttribute('drag-item') == item.item) {
                                                return true;
                                            }
                                        });
                                        simon.style.left = simonInitial[0].x + 'px';
                                        simon.style.top = simonInitial[0].y + 'px';
                                    }
                                }
                                return true;

                            } else {
                                initial.forEach(function (initialobj) {
                                    if (that.getAttribute('drag-item') === initialobj.item) {
                                        that.style.left = initialobj.x + 'px';
                                        that.style.top = initialobj.y + 'px';
                                    }
                                });
                                return false;
                            }
                        });
                        setTimeout(function () {
                            processQuestion();
                        }, 600);
                        that = undefined;
                    }
                };
                function processQuestion() {
                    var dragItemLocations = [];
                    [].forEach.call(container.querySelectorAll('[drag-item]'), function (item, index, arr) {
                        dragItemLocations.push({
                            item: item.getAttribute('drag-item'),
                            x: item.offsetLeft,
                            y: item.offsetTop,
                            x1: item.offsetLeft + item.offsetWidth,
                            y1: item.offsetTop + item.offsetHeight
                        });
                    });
                    dropZoneLocations.forEach(function (obj, objIndex, objArr) {
                        dragItemLocations.some(function (item, itemIndex, itemArr) {
                            if ((obj.x <= item.x && obj.x1 >= item.x || obj.x1 >= item.x && obj.x <= item.x1) && (obj.y <= item.y && obj.y1 >= item.y || obj.y1 >= item.y && obj.y <= item.y1)) {
                                answersObj[obj.zone] = item.item;
                                return true;
                            } else {
                                answersObj[obj.zone] = "(na)";
                                return false;
                            }
                        });
                    });
                    crtAns = JSON.parse(container.getAttribute('answer').replace(/\'/g, '"'));
                    container.setAttribute('user-answer', JSON.stringify(answersObj));
                }
            }
        }
    })