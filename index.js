const fs = require('fs');
const notion = require("@randumbpurson/notion-api-helper");
const axios = require("axios");


class monitor {

    constructor(initial_blocks = [], check_interval = 1, save_interval = 5){
        this.monitored_blocks = initial_blocks;
        this.config = {
            check_interval: check_interval,
            save_interval: save_interval

        }
        this.tasks = {};
        try {
            fs.readFile('integration.json', (err, integration_raw) => {
                if (err) {
                    console.log("Error reading integration.json", err);
                    return;
                }

                try {
                    let integration_data = JSON.parse(integration_raw);
                    this.integration = new notion.Integration(
                        integration_data.secret, 
                        integration_data.version | "2021-08-16"
                        )
                } catch (err) {
                    console.log("Error parsing JSON string:\n", err);
                }
            })
        } catch(err) {
            console.log("Couldn't read 'integration.json' file", err);
        }
    }

    add_block(block_type, block_id){
        this.monitored_blocks[this.monitored_blocks.length] = {
            "object": block_type,
            "id": block_id,
            "last_edited_time": null
        };   
    }

    check_blocks(){
        let modified = [];
        
        for (block in this.monitored_blocks){
            // get last edited time from Notion API
            let last_modified = this.integration.get_element(block["object"], block["id"])["last_edited_time"];
            if (block["last_edited_time"] == null){block["last_edited_time"] = last_modified;}
            // if updated date > cached date, push to output array and cache new date
            if (Date.parse(last_modified) > date.parse(block["last_edited_time"])){
                modified.push(block);
                block["last_edited_dat"] = last_modified;
            }
        }
        return modified;
    }

    save_block_states(){
        fs.writeFile("block_states.json", JSON.stringify(this.monitored_blocks), err => {
            if (err) {console.log('Error Saving Block State', err);}
        })
    }
    generate_webhooks(endpoint, modified){
        console.log(`Changes detected to ${modified}, sending webhooks to ${endpoint}`);
        axios.post(endpoint, {
            modified: modified
        }, {
            'Content-Type': 'application/json'
        }).catch((err) => {
            console.log("Error generating webhooks, make sure the provided endpoint is valid")
        });
    }

    start(endpoint){
        try {
            this.monitored_blocks = JSON.parse(fs.readFileSync('block_states.json'));
        }catch{
            this.monitored_blocks = {};
        }

        this.tasks['check_blocks'] = setInterval( () => {
		    let modified = this.check_blocks();
            this.generate_webhooks(endpoint, modified);
	    	
	    }, this.config.check_interval);

        this.tasks['save_block_states'] = setInterval( () => {
            this.save_block_states();
        }, this.config.save_interval);
    }

    stop(){
        for (task in this.tasks){
            task.stop();
        }
    }
}

module.exports = {monitor};
