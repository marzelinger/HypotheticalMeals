// ListPage.js
// Riley
// Larger page component to be shown in PageTemplate

import React from 'react';
import Filter from './Filter';
import PageTable from './PageTable'
import TableOptions from './TableOptions'
import SubmitRequest from './../../helpers/SubmitRequest'
import ItemStore from './../../helpers/ItemStore'
import ItemDetails from './ItemDetails'
import AddToManuGoal from './AddToManuGoal'
import { 
    Alert,
    Button,
    DropdownToggle,
    Modal} from 'reactstrap';
import * as Constants from './../../resources/Constants';
import './../../style/ListPage.css';
import GeneralNavBar from "../GeneralNavBar";


export default class ListPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            page_name: props.page_name,
            page_title: props.page_title,
            num_filters: 0,
            filter_value: '',
            filter_category: '',
            filter_options: props.filter_options,
            table_columns: props.table_columns,
            table_properties: props.table_properties,
            table_options: props.table_options,
            item_properties: props.item_properties,
            item_property_labels: props.item_property_labels,
            item_property_placeholder: props.item_property_placeholder,
            selected_items: [],
            detail_view_item: null,
            detail_view_options: [],
            data: [],
            loaded: false,
            error: null,
            details_modal: false,
            manu_goals_modal: false,
            manu_goals_data: [],
            simple: props.simple || false
        };
        this.toggle = this.toggle.bind(this);
    }

    toggle = (modalType) => {
        switch(modalType){
            case Constants.details_modal:
                this.setState({details_modal: !this.state.details_modal})
                break;
            case Constants.manu_goals_modal:
                console.log("here");
                this.setState({manu_goals_modal: !this.state.manu_goals_modal})
                break;
        }
    }   

    componentDidMount = () => {
        this.loadDataFromServer();
        if (this.state.data === []){
            this.loadDataFromServer();
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.filter_value !== this.state.filter_value || 
            prevState.filter_category !== this.state.filter_category){
                this.setState({ num_filters: 1 });
                this.loadDataFromServer();
        }
    }

    loadDataFromServer = () => {
        fetch('/api/' + this.state.page_name, { method: 'GET' })
          .then(data => data.json())
          .then((res) => {
            if (!res.success) this.setState({ error: res.error });
            else this.setState({ 
                data: res.data,
                loaded: true
            });
          });
        console.log(this.state.data);
    }

    //unused!
    showDetailsView = () => {
        //there's something fundamentally wrong with how I change CSS/JSX properties
        //using JS. It doesn't work here or on the item selection
        if (this.state){
          console.log(this.state.detail_view_item);
          return (this.state.detail_view_item ? <ItemDetails/> : null);
        }
      }


    onFilterSelection = (e, sel) => {
        this.setState({
            filter_category: sel
        });
    }

    onCreateNewItem = () => {
        var item = ItemStore.getEmptyItem(this.state.page_name, this.state.data, this);
        const newData = this.state.data.slice();
        newData.push(item);
        this.setState({ 
            data: newData,
            detail_view_item: item,
            detail_view_options: [Constants.details_create, Constants.details_delete, Constants.details_cancel]
        })
        this.toggle(Constants.details_modal);
    }

    onTableOptionSelection = async(e, opt) => {
        console.log(opt);
        switch (opt){
            case Constants.create_item:
                this.onCreateNewItem();
                break;
            case Constants.add_to_manu_goals:
                await this.onAddManuGoals();
                break;
        }
    }

    onAddManuGoals =  async() => {
        this.toggle(Constants.manu_goals_modal);
        await this.getManuGoalsData();
    }

    getManuGoalsData = () => {
        fetch('/api/manugoals', { method: 'GET' })
          .then(data => data.json())
          .then((res) => {
            console.log(res.data);
            if (!res.success) this.setState({ error: res.error });
            else this.setState({ 
                manu_goals_data: res.data
            });
            
          });
    }

    onSort = (event, sortKey) => {
        const data = this.state.data;
        data.sort((a,b) => a[sortKey].toString().localeCompare(b[sortKey]))
        this.setState({data})
    };

    onSelect = async (event, item) => {
        var newState = this.state.selected_items.slice();
        var loc = newState.indexOf(item);
        (loc > -1) ? newState.splice(loc, 1) : newState.push(item);
        await this.setState({ selected_items: newState});
    };

    onDetailViewSelect = (event, item) => {
        this.setState({ 
            detail_view_item: item ,
            detail_view_options: [Constants.details_save, Constants.details_delete, Constants.details_cancel]
        });
        this.toggle(Constants.details_modal);
    };


    onFilterValueChange = (event) => {
        this.setState({
            filter_value: event.target.value
        });
        console.log('this is the current filter_value: '+this.state.filter_value);
        //SubmitRequest.submitFilterRequest(this.state.page_name, item, this);


    }
    onDetailViewSubmit = (event, item, option) => {
        console.log(option);
        switch (option) {
            case Constants.details_create:
                SubmitRequest.submitCreateItem(this.state.page_name, item, this);
                break;
            case Constants.details_save:
                SubmitRequest.submitUpdateItem(this.state.page_name, item, this);
                break;
            case Constants.details_delete:
                SubmitRequest.submitDeleteItem(this.state.page_name, item, this);
                break;
            case Constants.details_cancel:
                break;
        }
        this.setState({ 
            detail_view_item: null,
            detail_view_options: []
        });
        console.log('this print message is from line 156 of listpage.js');
        this.loadDataFromServer();
        this.toggle(Constants.details_modal);
    }

    onPropChange = (event, item, prop) => {
        var newData = this.state.data.slice();
        var ind = newData.indexOf(item);
        newData[ind][prop] = event.target.value;
        this.setState({ data: newData });
    };

    render() {
        return (
            <div className="list-page">
                <div className="options-container" id={this.state.simple ? "simple" : "complex"}>
                        <Filter 
                            value={this.state.filter_value}
                            selection={this.state.filter_category} 
                            categories={this.state.filter_options}
                            handleValueChange={this.onFilterValueChange}
                            handleFilterSelection={this.onFilterSelection}>
                        </Filter>
                        <TableOptions
                        table_options={this.state.table_options}
                        handleTableOptionSelection={this.onTableOptionSelection}
                        />
                </div>
                <div>
                    <PageTable 
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.state.data}
                        selected_items={this.state.selected_items}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                    />
                </div>
                <Modal isOpen={this.state.details_modal} toggle={this.toggle} id="popup" className='item-details'>
                    <ItemDetails
                            item={this.state.detail_view_item}
                            item_properties={this.state.item_properties}
                            item_property_labels={this.state.item_property_labels}
                            item_property_placeholder={this.state.item_property_placeholder}
                            detail_view_options={this.state.detail_view_options}
                            handlePropChange={this.onPropChange}
                            handleDetailViewSubmit={this.onDetailViewSubmit}
                        />
                    <Alert
                        value={this.state.error}
                        color='danger'/>
                </Modal>
                <AddToManuGoal selected_skus={this.state.selected_items} isOpen={this.state.manu_goals_modal} toggle={(toggler) => this.toggle(toggler)} manu_goals_data={this.state.manu_goals_data}></AddToManuGoal>
            </div>
        );
    }

}