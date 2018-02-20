class TicketApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: [],
            item: null,
            view: 0
        };
        this.goToSearch = this.goToSearch.bind(this)
        this.goToResults = this.goToResults.bind(this)
        this.goToDetails = this.goToDetails.bind(this)
    }

    render() {
        let views = [
            <SearchView results={this.goToResults}/>,
            <ResultView back={this.goToSearch} results={this.state.results} showDetails={this.goToDetails}/>,
            <DetailsView back={this.goToResults} item={this.state.item}/>]

        return (
            <div className="wrapper">
                <div className="row header">
                    <h1>Ticket thingymajig</h1>
                </div>
                <div className="row content">
                    {views[this.state.view]}
                </div>
                <div className="row footer">
                    <h2>Some other stuff</h2>
                </div>
            </div>)
    }

    goToSearch() {
        this.setState({view: 0})
    }

    goToResults(results=null) {
        if(results != null) {
            this.setState({results:results, view: 1})
        } else {
            this.setState({view: 1})
        }
    }

    goToDetails(item) {
        this.setState({view: 2, item:item})
    }
}

class SearchView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {input:''};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateInput = this.updateInput.bind(this);
    }

    render() {
        return (
            <div className="view">
            <div className="row">
            <h3>What event are you looking for?</h3>
            </div>

            <form className="searchField" onSubmit={this.handleSubmit}>
            <input type="text" value={this.state.input} name="search" placeholder="Search..." onChange={this.updateInput}/>
            <button type="submit"><i className="fa fa-search"></i></button>
            </form>
            </div>
        );
    }

    updateInput(e) {
        this.setState({input: e.target.value})
    }

    handleSubmit(e) {
        e.preventDefault();
        var country = 'CA'
        var apiKey = 'GiSmszJzsoobutvFJt9QoGXUVMVHV68R'


        // this.state.input has search term
        // from the search options generate a api url
        var url = String(`https://app.ticketmaster.com/discovery/v2/events.json?countryCode=${country}&apikey=${apiKey}&keyword=${this.state.input}`)

            fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw "No Data"
                }
            })
            .then(json => {
                console.log("Results")
                console.log(json)
                let newItems = []
                let itemDict = {}
                if(!('_embedded' in json) || !('events' in json._embedded)) {
                    console.log("No results")
                } else {
                    for (let item in json._embedded.events) {
                        let event = json._embedded.events[item]
                        let key = event.name
                        if(itemDict[key] == undefined)
                            itemDict[key] = {name:event.name, items:[event]}
                        else
                            itemDict[key].items.push(event)
                    }
                    // Convert to list
                    for (var k in itemDict)
                        newItems.push(itemDict[k])
                }
                this.props.results(newItems)
            })
            .catch(error => console.log(error))
        }
}

class ResultView extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="view">
            <div className="row viewTitle">
            <h3>Results</h3>
            <button className="back" onClick={this.props.back}>
            Back
            </button>
            </div>
            <div className="row results">
            <ResultList items={this.props.results} showDetails={this.props.showDetails} />
            </div>
            </div>
        );
    }
}

class DetailsView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          photos: this.setupGallery(props.item.items[0].images),
          thumbnails: this.setupThumbnail(props.item.items[0].images),
          display: props.item.items[0].images[0].url,
          info: this.setupInfo(props.item),
          priceRange: this.setupPriceRange(props.item),
          location: this.setupLocation(props.item),
          link: this.setupLink(props.item)
        };

        this.backHelper = this.backHelper.bind(this);
        console.log("Looking at")
        console.log(props.item)
    }

    backHelper(e) {
        this.props.back(null)
    }

    render() {
        // Can access the item through this.props.item
        return (
            <div className="view">
              <div className="row viewTitle">
                <h3>{this.props.item.name}</h3>
                <button className="back" onClick={this.backHelper}>
                Back
                </button>
              </div>
              <div className="row details">
                <div className="info">
                  <div className="firstColumn">
                    {this.state.priceRange}
                  </div>
                  <div className="secondColumn">
                    {this.state.info}
                  </div>
                </div>
                <div className="images">
                  <div className="thumbnails">
                    <button className="w3-button w3-display-left" onClick={() => this.plusDivs(-1)}>&#10094;</button>
                    <img src={this.state.thumbnails[0]} height="100" width ="150" onClick={() => this.setState({display: this.state.thumbnails[0]})} />
                    <img src={this.state.thumbnails[1]} height="100" width ="150" onClick={() => this.setState({display: this.state.thumbnails[1]})} />
                    <img src={this.state.thumbnails[2]} height="100" width ="150" onClick={() => this.setState({display: this.state.thumbnails[2]})} />
                    <button className="w3-button w3-display-right" onClick={() => this.plusDivs(+1)}>&#10095;</button>
                  </div>
                  <div className="mainPhoto">
                    <img src={this.state.display} height="400" width ="600" />
                  </div>
                </div>
              </div>
            </div>
        );
    }

    setupThumbnail(photos){
      var num = Math.min(photos.length, 3);
      var array = [];
      for (var i = 0; i < num; i++) {
        array.push(photos[i].url);
      }
      return array;
    }

    setupGallery(photos){
      var num = photos.length;
      var array = [];
      for (var i = 0; i < num; i++) {
        array.push(photos[i].url);
      }
      return array;
    }

    setupPriceRange(object){
      if (object.items[0].hasOwnProperty("priceRanges")){
        return object.items[0].priceRanges[0].min.toString() +"-"+ object.items[0].priceRanges[0].max.toString();
      }
      else{
        return "N/A";
      }
    }

    setupInfo(object){
      if (object.items[0].hasOwnProperty("info")){
        return object.items[0].info;
      }
      else{
        return "N/A";
      }
    }

    setupLocation(object){
      var location = {};
      if (object.items[0]._embedded.venues[0].hasOwnProperty("postalCode"){
        location.postalCode = object.items[0]._embedded.venues[0].postalCode;
      }
      else{
        location.postalCode = "N/A";
      }
      if (object.items[0]._embedded.venues[0].hasOwnProperty("name"){
        location.name = object.items[0]._embedded.venues[0].name;
      }
      else{
        location.name = "N/A";
      }
      if (object.items[0]._embedded.venues[0].hasOwnProperty("city"){
        location.postalCode = object.items[0]._embedded.venues[0].city.name;
      }
      else{
        location.city = "N/A";
      }
      if (object.items[0]._embedded.venues[0].hasOwnProperty("country"){
        location.city = object.items[0]._embedded.venues[0].country.name;
      }
      else{
        location.country = "N/A";
      }
    }

    setupLink(object){
      if (object.items[0].hasOwnProperty("info")){
        return object.items[0].info;
      }
      else{
        return "N/A";
      }
    }

    plusDivs(num){
      var array = [];
      for(var a = 0; a < this.state.thumbnails.length; a++){
        var path = this.state.thumbnails[a];
        var index = this.state.photos.indexOf(path);
        if(num == -1){
          if(index == 0){
            array.push(this.state.photos[this.state.photos.length-1]);
          }
          else{
            array.push(this.state.photos[index-1]);
          }
        }
        if(num == 1){
          if(index == this.state.photos.length-1){
            array.push(this.state.photos[0]);
          }
          else{
            array.push(this.state.photos[index+1]);
          }
        }
      }
      this.setState({thumbnails: array});

    }

}

class ResultList extends React.Component {
    constructor(props) {
        super(props)

    }
    render() {
        return (
            <ul>
            {this.props.items.map(item => (
                <Item key={item.name} item={item} showDetails={this.props.showDetails} />
            ))}
            </ul>
        );
    }
}

class Item extends React.Component {
    constructor(props) {
        super(props)
        this.detailsHelper = this.detailsHelper.bind(this)
    }

    detailsHelper() {
        this.props.showDetails(this.props.item);
    }
    render() {
        return (
            <li>
                <div class="resultItem" onClick={this.detailsHelper}>
                    <h4> {this.props.item.name} </h4>
                </div>
            </li>
        )
    }
}

ReactDOM.render(<TicketApp />, document.getElementById('root'));
