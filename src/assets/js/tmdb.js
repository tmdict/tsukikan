import React from 'react';
import { createRoot } from 'react-dom/client';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cat: '',
      tag: '',
      sort: 'date',
      desc: true,
    };
  }
  updateSort(sortby) {
    if (this.state.sort !== sortby) {
      this.setState({ sort: sortby });
      this.setState({ desc: false });
    } else {
      this.setState({ desc: !this.state.desc });
    }
  }
  updateFilter(stateType, filter) {
    this.setState({ [stateType]: filter });
  }
  render() {
    let categories = [];
    let tags = [];

    let dataset = this.props.data.slice();
    //dataset = _.sortBy(dataset, [function (d) { return d[this.state.sort].toLowerCase(); }.bind(this)]);
    dataset = dataset.sort((a, b) => a[this.state.sort].toLowerCase().localeCompare(b[this.state.sort].toLowerCase()));
    if (this.state.desc) dataset.reverse();
    let order = this.state.desc ? '▾' : '▴';

    // Populte filter arrays with values from current data set
    dataset.forEach((item) => {
      categories.push(item.category);
      item.tag.forEach((tag, i) => tags.push(tag));
    });

    // Sort array and rid of duplicate
    categories = [...new Set(categories)].sort();
    tags = [...new Set(tags)].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    return (
      <div>
        <div className="center">
          <img src="../src/img/tmdb.png" title="TM Merchandise Datebase" alt="tmdb" />
        </div>

        <div className="tmdb-list">
          <div className="tmdb-item-header group">
            <div className="item-title">
              <a onClick={() => this.updateSort('en')} className={this.state.sort === 'en' ? 'active' : ''}>
                Title {this.state.sort === 'en' ? order : ''}
              </a>
            </div>
            <div className="item-category">
              <a onClick={() => this.updateSort('category')} className={this.state.sort === 'category' ? 'active' : ''}>
                Category {this.state.sort === 'category' ? order : ''}
              </a>
            </div>
            <div className="item-date">
              <a onClick={() => this.updateSort('date')} className={this.state.sort === 'date' ? 'active' : ''}>
                Release {this.state.sort === 'date' ? order : ''}
              </a>
            </div>
          </div>

          <ul>
            {dataset.map((item, i) => {
              if (
                (this.state.cat === '' || item.category === this.state.cat) &&
                (this.state.tag === '' || item.tag.flat().includes(this.state.tag))
              ) {
                const icon_url = '../src/img/tmdb/ico/' + item.img;
                return (
                  <li key={i}>
                    <a href={item.url}>
                      <div className="tmdb-item group">
                        <div className="item-icon">
                          <img src={icon_url} />
                        </div>
                        <div className="item-title">{item.en}</div>
                        <div className="item-category">{item.category}</div>
                        <div className="item-date">{item.date}</div>
                      </div>
                    </a>
                  </li>
                );
              }
            })}
          </ul>
        </div>

        <div className="tmdb-filter">
          <h2>category</h2>
          <ul>
            <li className={this.state.cat === '' ? 'active' : ''}>
              <a onClick={() => this.updateFilter('cat', '')} href="#">
                <div className="filter-item">All</div>
              </a>
            </li>
            {categories.map((cat, i) => {
              const url = '#+cat.' + cat + (this.state.tag !== '' ? '+tag.' + this.state.tag : '');
              return (
                <li key={i} className={this.state.cat === cat ? 'active' : ''}>
                  <a onClick={() => this.updateFilter('cat', cat)} href={'#' + cat}>
                    <div className="filter-item">{cat}</div>
                  </a>
                </li>
              );
            })}
          </ul>

          <h2>tags</h2>
          <ul>
            <li className={this.state.tag === '' ? 'active' : ''}>
              <a onClick={() => this.updateFilter('tag', '')} href="#">
                <div className="filter-item">All</div>
              </a>
            </li>
            {tags.map((tag, i) => {
              return (
                <li key={i} className={this.state.tag === tag ? 'active' : ''}>
                  <a onClick={() => this.updateFilter('tag', tag)} href={'#' + tag}>
                    <div className="filter-item">{tag}</div>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="group"></div>
      </div>
    );
  }
}

const root = createRoot(document.getElementById('main'));
root.render(<App ver={db.version} data={db.data} />);
