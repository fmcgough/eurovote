drop table if exists votes;
drop table if exists countries;
create table countries (
	id serial primary key, 
	name varchar(30)
	);
create table votes (
	id serial primary key, 
	score integer not null, 
	country_id integer not null, 
	constraint fk_vote_country_id foreign key (country_id) references countries (id)
	);