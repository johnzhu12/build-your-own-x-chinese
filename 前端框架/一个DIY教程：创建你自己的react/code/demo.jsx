const stories = [
    { name: "Didact introduction", url: "http://bit.ly/2pX7HNn" },
    { name: "Rendering DOM elements ", url: "http://bit.ly/2qCOejH" },
    { name: "Element creation and JSX", url: "http://bit.ly/2qGbw8S" },
    { name: "Instances and reconciliation", url: "http://bit.ly/2q4A746" },
    { name: "Components and state", url: "http://bit.ly/2rE16nh" }
];

class App extends Didact.Component {
    render() {
        return (
            <div>
                <h1>Didact Stories</h1>
                <ul>
                    {this.props.stories.map(story => {
                        return <Story name={story.name} url={story.url} />;
                    })}
                </ul>
            </div>
        );
    }
}

class Story extends Didact.Component {
    constructor(props) {
        super(props);
        this.state = { likes: Math.ceil(Math.random() * 100) };
    }
    like() {
        this.setState({
            likes: this.state.likes + 1
        });
    }
    render() {
        const { name, url } = this.props;
        const { likes } = this.state;
        const likesElement = <span />;
        return (
            <li>
                <button onClick={e => this.like()}>{likes}<b>❤️</b></button>
                <a href={url}>{name}</a>
            </li>
        );
    }
}

Didact.render(<App stories={stories} />, document.getElementById("root"));