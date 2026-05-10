create table carts
(
    id          BINARY(16) default (UUID_TO_BIN(UUID())) not null,
    dateCreated DATE       default (curdate())           not null,
    constraint carts_pk
        primary key (id)
);
#----------------------
create table cart_items
(
    id         BIGINT auto_increment,
    cart_id    BINARY(16)    not null,
    product_id BIGINT        not null,
    quantity   int default 1 not null,
    constraint cart_items_pk
        primary key (id),
    constraint cart_items_cart_product
        unique (cart_id, product_id),
    constraint cart_items_carts_id_fk
        foreign key (cart_id) references carts (id)
            on delete cascade,
    constraint cart_items_products_id_fk
        foreign key (product_id) references products (id)
            on delete cascade
);

