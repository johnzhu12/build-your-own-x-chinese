"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @jsx Didact.createElement */
var Didact = importFromBelow();

var stories = [{ name: "Didact introduction", url: "http://bit.ly/2pX7HNn" }, { name: "Rendering DOM elements ", url: "http://bit.ly/2qCOejH" }, { name: "Element creation and JSX", url: "http://bit.ly/2qGbw8S" }, { name: "Instances and reconciliation", url: "http://bit.ly/2q4A746" }, { name: "Components and state", url: "http://bit.ly/2rE16nh" }];

var App = function (_Didact$Component) {
    _inherits(App, _Didact$Component);

    function App() {
        _classCallCheck(this, App);

        return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
    }

    _createClass(App, [{
        key: "render",
        value: function render() {
            return Didact.createElement(
                "div",
                null,
                Didact.createElement(
                    "h1",
                    null,
                    "Didact Stories"
                ),
                Didact.createElement(
                    "ul",
                    null,
                    this.props.stories.map(function (story) {
                        return Didact.createElement(Story, { name: story.name, url: story.url });
                    })
                )
            );
        }
    }]);

    return App;
}(Didact.Component);

var Story = function (_Didact$Component2) {
    _inherits(Story, _Didact$Component2);

    function Story(props) {
        _classCallCheck(this, Story);

        var _this2 = _possibleConstructorReturn(this, (Story.__proto__ || Object.getPrototypeOf(Story)).call(this, props));

        _this2.state = { likes: Math.ceil(Math.random() * 100) };
        return _this2;
    }

    _createClass(Story, [{
        key: "like",
        value: function like() {
            this.setState({
                likes: this.state.likes + 1
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var _props = this.props,
                name = _props.name,
                url = _props.url;
            var likes = this.state.likes;

            var likesElement = Didact.createElement("span", null);
            return Didact.createElement(
                "li",
                null,
                Didact.createElement(
                    "button",
                    { onClick: function onClick(e) {
                            return _this3.like();
                        } },
                    likes,
                    Didact.createElement(
                        "b",
                        null,
                        "\xE2\uFFFD\xA4\xEF\xB8\uFFFD"
                    )
                ),
                Didact.createElement(
                    "a",
                    { href: url },
                    name
                )
            );
        }
    }]);

    return Story;
}(Didact.Component);

Didact.render(Didact.createElement(App, { stories: stories }), document.getElementById("root"));

/** Didact **/

function importFromBelow() {
    var rootInstance = null;
    var TEXT_ELEMENT = "TEXT_ELEMENT";

    function createElement(type, config) {
        var _ref;

        var props = Object.assign({}, config);

        for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            args[_key - 2] = arguments[_key];
        }

        var hasChildren = args.length > 0;
        var rawChildren = hasChildren ? (_ref = []).concat.apply(_ref, args) : [];
        props.children = rawChildren.filter(function (c) {
            return c != null && c !== false;
        }).map(function (c) {
            return c instanceof Object ? c : createTextElement(c);
        });
        return { type: type, props: props };
    }

    function createTextElement(value) {
        return createElement(TEXT_ELEMENT, { nodeValue: value });
    }

    function render(element, container) {
        var prevInstance = rootInstance;
        var nextInstance = reconcile(container, prevInstance, element);
        rootInstance = nextInstance;
    }

    function reconcile(parentDom, instance, element) {
        if (instance == null) {
            // Create instance
            var newInstance = instantiate(element);
            parentDom.appendChild(newInstance.dom);
            return newInstance;
        } else if (element == null) {
            // Remove instance
            parentDom.removeChild(instance.dom);
            return null;
        } else if (instance.element.type !== element.type) {
            // Replace instance
            var _newInstance = instantiate(element);
            parentDom.replaceChild(_newInstance.dom, instance.dom);
            return _newInstance;
        } else if (typeof element.type === "string") {
            // Update instance
            updateDomProperties(instance.dom, instance.element.props, element.props);
            instance.childInstances = reconcileChildren(instance, element);
            instance.element = element;
            return instance;
        } else {
            //Update composite instance
            instance.publicInstance.props = element.props;
            var childElement = instance.publicInstance.render();
            var oldChildInstance = instance.childInstance;
            var childInstance = reconcile(parentDom, oldChildInstance, childElement);
            instance.dom = childInstance.dom;
            instance.childInstance = childInstance;
            instance.element = element;
            return instance;
        }
    }

    function reconcileChildren(instance, element) {
        var dom = instance.dom;
        var childInstances = instance.childInstances;
        var nextChildElements = element.props.children || [];
        var newChildInstances = [];
        var count = Math.max(childInstances.length, nextChildElements.length);
        for (var i = 0; i < count; i++) {
            var childInstance = childInstances[i];
            var childElement = nextChildElements[i];
            var newChildInstance = reconcile(dom, childInstance, childElement);
            newChildInstances.push(newChildInstance);
        }
        return newChildInstances.filter(function (instance) {
            return instance != null;
        });
    }

    function instantiate(element) {
        var type = element.type,
            props = element.props;

        var isDomElement = typeof type === "string";

        if (isDomElement) {
            // Instantiate DOM element
            var isTextElement = type === TEXT_ELEMENT;
            var dom = isTextElement ? document.createTextNode("") : document.createElement(type);

            updateDomProperties(dom, [], props);

            var childElements = props.children || [];
            var childInstances = childElements.map(instantiate);
            var childDoms = childInstances.map(function (childInstance) {
                return childInstance.dom;
            });
            childDoms.forEach(function (childDom) {
                return dom.appendChild(childDom);
            });

            var instance = { dom: dom, element: element, childInstances: childInstances };
            return instance;
        } else {
            // Instantiate component element
            var _instance = {};
            var publicInstance = createPublicInstance(element, _instance);
            var childElement = publicInstance.render();
            var childInstance = instantiate(childElement);
            var _dom = childInstance.dom;

            Object.assign(_instance, { dom: _dom, element: element, childInstance: childInstance, publicInstance: publicInstance });
            return _instance;
        }
    }

    function updateDomProperties(dom, prevProps, nextProps) {
        var isEvent = function isEvent(name) {
            return name.startsWith("on");
        };
        var isAttribute = function isAttribute(name) {
            return !isEvent(name) && name != "children";
        };

        // Remove event listeners
        Object.keys(prevProps).filter(isEvent).forEach(function (name) {
            var eventType = name.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[name]);
        });

        // Remove attributes
        Object.keys(prevProps).filter(isAttribute).forEach(function (name) {
            dom[name] = null;
        });

        // Set attributes
        Object.keys(nextProps).filter(isAttribute).forEach(function (name) {
            dom[name] = nextProps[name];
        });

        // Add event listeners
        Object.keys(nextProps).filter(isEvent).forEach(function (name) {
            var eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextProps[name]);
        });
    }
    function createPublicInstance(element, internalInstance) {
        var type = element.type,
            props = element.props;

        var publicInstance = new type(props);
        publicInstance.__internalInstance = internalInstance;
        return publicInstance;
    }

    var Component = function () {
        function Component(props) {
            _classCallCheck(this, Component);

            this.props = props;
            this.state = this.state || {};
        }

        _createClass(Component, [{
            key: "setState",
            value: function setState(partialState) {
                this.state = Object.assign({}, this.state, partialState);
                updateInstance(this.__internalInstance);
            }
        }]);

        return Component;
    }();

    function updateInstance(internalInstance) {
        var parentDom = internalInstance.dom.parentNode;
        var element = internalInstance.element;
        reconcile(parentDom, internalInstance, element);
    }

    return {
        createElement: createElement,
        render: render,
        Component: Component
    };
}
//# sourceMappingURL=Didact-before.js.map