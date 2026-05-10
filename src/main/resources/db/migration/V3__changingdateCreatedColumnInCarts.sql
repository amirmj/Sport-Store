alter table carts
    change dateCreated date_created date default (curdate()) not null;