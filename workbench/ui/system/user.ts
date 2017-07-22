import { Component, OnInit } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "user",
    templateUrl: "user.html",
    styleUrls: ["../home/home.component.css", "./user.css"]
})
export class UserComponent implements OnInit {
    name: string;

    constructor() {
        this.name = "个人中心";
    }

    ngOnInit() {

    }
}