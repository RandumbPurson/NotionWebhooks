const fs = require('fs');
const cron = require("node-cron");
const notion = require("@randumbpurson/notion-api-helper");
const axios = require("axios");


class monitor {

    constructor(initial_blocks = [], check_interval = 10, save_interval = 5){
        this.monitored_blocks = initial_blocks;
        this.config = {
            check_interval: check_interval,
            save_interval: save_interval

        }
        fs.readFile('integration.json', (err, integration_raw) => {
            if (err) {
                console.log("Error reading integration.json", err);
                return;
            }

            try {
                let integration_data = JSON.parse(integration_raw);
                this.integration = notion.integration(
                    integration_data.secret, 
                    integration_data.version | "2021-08-16"
                    )
            } catch (err) {
                console.log("Error parsing JSON string", err);
            }
        })
    }

    add_block(block_type, block_id){
        monitored_blocks.push({
            "object": block_type,
            "id": block_id,
            "last_edited_time": null
        });   
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
    generate_webhooks(){

    }
    start_monitor(){
        this.monitored_blocks = JSON.parse(fs.readFileSync('block_states.json'));
        cron.schedule(`${this.config.check_interval} * * * *`, {
		let modified = this.check_blocks());
	    	
	}
        cron.schedule(`* ${this.config.save_interval} * * *`, this.save_block_states());
    }
}
