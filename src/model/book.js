import { createResourceTable } from "../util/query-util";

export default class Book {
    constructor(params) {
        this.title = params && params.title;
        this.authors = params && params.authors;
        this.publication_date = params && params.publication_date;
        this.intro = params && params.intro;
        this.rating = params && params.rating;
        this.total_review = params && params.total_review;
        this.total_page = params && params.total_page;
        this.dimension_width = params && params.dimension_width;
        this.dimension_height = params && params.dimension_height;
        this.image_url = params && params.image_url;
    }

    static properties = [
        { field: 'title', maxLength: '255' },
        { field: 'authors', type: 'JSON' },
        { field: 'publication_date', type: 'DATETIME' },
        { field: 'intro', type: 'TEXT' },
        { field: 'rating', type: 'FLOAT' },
        { field: 'total_review', type: 'INT' },
        { field: 'total_page', type: 'INT' },
        { field: 'dimension_width', type: 'INT' },
        { field: 'dimension_height', type: 'INT' },
        { field: 'image_url', maxLength: '255' },
    ];

    static createTable() {
        return createResourceTable(this.tableName, this.properties);
    }

    static tableName = "books";
}