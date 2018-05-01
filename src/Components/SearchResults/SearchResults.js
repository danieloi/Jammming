import React, { Component } from 'react';
import TrackList from '../TrackList/TrackList.js';
import './SearchResults.css';

class SearchResults extends Component {
    render() {
        // console.log(`Here are the search results: ${this.props.searchResults[0]}`);
        return (
            <div className="SearchResults">
                <h2>Results</h2>
                {/* <!-- Add a TrackList component --> */}
                <TrackList tracks={this.props.searchResults} onAdd={this.props.onAdd} isRemoval={false}/>
            </div>
        );
    }
}
export default SearchResults;