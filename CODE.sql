create database Bridge;
use Bridge;

create table Users(

id_user int NOT NULL AUTO_INCREMENT,

email varchar(255) NOT NULL,

username varchar(255) NOT NULL,

bio text(300),
profile_picture longtext,

pass_word varchar(255),

status tinyint,

PRIMARY KEY (id_user)

);


create table Tags(

id_tag int NOT NULL auto_increment,

tag_name varchar(255),

category varchar(255) NOT NULL,

PRIMARY KEY (id_tag)

);

alter table Tags 
modify tag_name varchar(255) NOT NULL;

alter table Tags 
modify category varchar(255);

create table Chats(

id_chat int NOT NULL auto_increment,

id_user int,

title varchar(255) NOT NULL,

PRIMARY KEY (id_chat),

FOREIGN KEY (id_user) REFERENCES Users(id_user)

);

create table ChatMessage(

id_message int NOT NULL auto_increment,

content longtext,

id_chat int,

id_user int,

time_stamp timestamp NOT NULL,

sender varchar(255) NOT NULL,
state varchar(255) NOT NULL,

PRIMARY KEY (id_message),

FOREIGN KEY (id_chat) REFERENCES Chats(id_chat),

FOREIGN KEY (id_user) REFERENCES Chats(id_user)

);

create table taglist(

id_user int,

id_tag int,

foreign key (id_user) references Users(id_user),

foreign key (id_tag) references Tags(id_tag)

);

create table friendlist(

id_user int,
id_friend int,

foreign key (id_user) references Users(id_user),

foreign key (id_friend) references Users(id_user)

);

create table UserChat(

id_user int,

id_chat int,

foreign key (id_user) references Users(id_user),

foreign key (id_chat) references Chats(id_chat)

);




/* create new user */
INSERT INTO Users (email, username, pass_word) VALUES ('given email', 'given username', 'given password');

/*'filtering taglist to find specific tags'*/
SELECT tag_name FROM Tags WHERE tag_name like "%INPUT";

/*'add tag to user'*/
INSERT INTO taglist (id_user, id_tag) VALUES ('this user id', 'chosen tag'); 

/*'remove tag from user'*/
DELETE FROM taglist WHERE id_user='this user id' AND id_tag='Selected tag';

/*'add friend to user || NEEDS TO CHECK FOR DUPLICATES'*/
INSERT INTO friendlist (id_user, id_user) VALUES ('this user id', 'chosen friend id'); 

/*'remove from friend list'*/
DELETE FROM friendlist WHERE id_user='this user id' AND id_user='Selected friend';

/*'filter FRIENDLIST  through front end code*/
/*SELECT username FROM friendlist WHERE user_name like "%INPUT";
SELECT username FROM Users WHERE user_name like "%INPUT" AND ;*/

/*'finding random chat' || WHEN IT FINDS A PERSON, CREATE A CHAT WITH ALWAYS THE TAG NAMES AS A TITLE || WILL HAVE TO WRITE FUCNTION THAT RUNS LIST FOR EACH INDIVIDUAL TAG THEN CHECKS IF THEY MATCH CRITERIA LIKE THE ONE ALREADY IN JAVASCRIPT*/


/*'create chatroom'*/
INSERT INTO Chats (Title) VALUE ('user input');
INSERT INTO UserChat (id_user, id_chat) VALUES ('creator/this user' , 'created above' );

/*'add friends to specific chat'*/
INSERT INTO UserChat (id_user, id_chat) VALUES ('selected friend', 'chosen chat');

/*'remove participant from specific chat'*/ /* CALL THIS THROUGH A VOTE TO KICK IN THE FRONT END*/
DELETE FROM UserChat WHERE id_user='selected person to kick' AND id_chat='this chat';

/*shows all chat message in one chat ordered by timestamp*/
SELECT * FROM ChatMessage  WHERE id_chat='this chatroom' ORDER BY timestamp DESC;

/* find chat with one tag only */
SELECT id_user FROM taglist WHERE id_tag='given tag/tag used for search';
/*pick random*/
INSERT INTO Chats (Title) VALUE ('name of tag in common');
INSERT INTO UserChat (id_user, id_chat) VALUES ( 'searcher id', 'abovechat id');
INSERT INTO UserChat (id_user, id_chat) VALUES ( 'found id', 'abovechat id');




/*creating fake data*/
INSERT INTO Users(email, username, status) VALUES ('test@email', 'theros', 0);
INSERT INTO Tags(tag_name) VALUES ('delta');
INSERT INTO taglist (id_user, id_tag) VALUES (4, 1);
SELECT id_user FROM taglist WHERE id_tag=1 AND NOT id_user=1;

INSERT INTO Chats (Title) VALUE ('alpha');
INSERT INTO UserChat (id_user, id_chat) VALUES ( 1, 1);
INSERT INTO UserChat (id_user, id_chat) VALUES ( 4, 1);

INSERT INTO ChatMessage (content, time_stamp, sender, state, id_chat) VALUES ( 'blablabla', NOW(), 'thales', 'sent', 1);
INSERT INTO ChatMessage (content, time_stamp, sender, state, id_chat) VALUES ( 'SSSSSSSSSSS', NOW(), 'simona', 'sent', 1);


select * from Users;
select * from Tags;
select * from taglist;
select * from userChat;
select * from ChatMessage WHERE id_chat=1;

create table ChatMessage(

id_message int NOT NULL auto_increment,

content longtext,

id_chat int,

id_user int,

time_stamp timestamp NOT NULL,

sender varchar(255) NOT NULL,
state varchar(255) NOT NULL,

PRIMARY KEY (id_message),

FOREIGN KEY (id_chat) REFERENCES Chats(id_chat),

FOREIGN KEY (id_user) REFERENCES Chats(id_user)

);

SELECT UNIX_TIMESTAMP();
SELECT NOW();