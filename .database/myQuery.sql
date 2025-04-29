--CREATE TABLE extension (
  -- extID INTEGER NOT NULL PRIMARY KEY,
  -- name TEXT NOT NULL,
  -- hyperlink TEXT NOT NULL,
  -- about TEXT NOT NULL,
  -- image TEXT NOT NULL,
  -- language TEXT NOT NULL
--);

--INSERT INTO extension(extID, name, hyperlink, about, image, language)
--VALUES (1, "Live Server", "https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer",
--"Launch a development local Server with live reload feature for static & dynamic pages", "https://ritwickdey.gallerycdn.vsassets.io/extensions/ritwickdey/liveserver/5.7.9/1661914858952/Microsoft.VisualStudio.Services.Icons.Default","HTML CSS JS");

-- SELECT * FROM extension;
-- SELECT * FROM extensiocd /Users/nafridhnafeel/myPWAn WHERE language LIKE 'HTML CSS JS';



-- INSERT INTO extension(extID,name,hyperlink,about,image,language) VALUES (X,"","","","","");


CREATE TABLE IF NOT EXISTS books (
    isbn TEXT PRIMARY KEY, 
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover_image TEXT,  -- Change LONGBLOB to TEXT for image URLs?
    series TEXT,
    genre_ship TEXT,
    publish_complete_date TEXT,
    pages_words INTEGER,
    read_status TEXT,
    rating REAL,
    hours_to_read REAL,
    description TEXT
);

INSERT INTO books (isbn, title, author, cover_image, series, genre_ship, publish_complete_date, pages_words, read_status, rating, hours_to_read, description)
SELECT '9780439139601', 'Harry Potter and the Goblet of Fire', 'J.K. Rowling', 'goblet_of_fire.jpg', 'Harry Potter', 'Fantasy', '2000-07-08', 734, 'Completed', 4.9, 20, 'Harry faces the Triwizard Tournament in his fourth year at Hogwarts.'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780439139601');

INSERT INTO books (isbn, title, author, cover_image, series, genre_ship, publish_complete_date, pages_words, read_status, rating, hours_to_read, description) 
VALUES 
('9780061120084', 'To Kill a Mockingbird', 'Harper Lee', 'to_kill_a_mockingbird.jpg', NULL, 'Classic Fiction', '1960-07-11', 281, 'Completed', 4.8, 10, 'A novel of racial injustice and childhood in the Deep South.'),

('9780451524935', '1984', 'George Orwell', '1984.jpg', NULL, 'Dystopian', '1949-06-08', 328, 'Completed', 4.7, 12, 'A dystopian novel about a totalitarian regime under Big Brother.'),

('9780547928227', 'The Hobbit', 'J.R.R. Tolkien', 'the_hobbit.jpg', 'Middle-earth', 'Fantasy', '1937-09-21', 310, 'Completed', 4.8, 11, 'Bilbo Baggins embarks on a grand adventure with dwarves and a wizard.'),

('9780307588371', 'The Girl with the Dragon Tattoo', 'Stieg Larsson', 'dragon_tattoo.jpg', 'Millennium', 'Thriller', '2005-08-01', 465, 'Completed', 4.5, 14, 'A journalist and a hacker investigate a mysterious disappearance.'),

('9780743273565', 'The Great Gatsby', 'F. Scott Fitzgerald', 'great_gatsby.jpg', NULL, 'Classic Fiction', '1925-04-10', 180, 'Completed', 4.4, 6, 'A critique of the American Dream in the Roaring Twenties.'),

('9780385533225', 'The Night Circus', 'Erin Morgenstern', 'night_circus.jpg', NULL, 'Fantasy', '2011-09-13', 387, 'Completed', 4.6, 13, 'A magical competition between two illusionists unfolds in a mysterious circus.'),

('9780307277671', 'The Road', 'Cormac McCarthy', 'the_road.jpg', NULL, 'Post-Apocalyptic', '2006-09-26', 287, 'Completed', 4.3, 9, 'A father and son journey through a desolate world after an unspecified apocalypse.'),

('9780062315007', 'The Alchemist', 'Paulo Coelho', 'the_alchemist.jpg', NULL, 'Philosophical Fiction', '1988-04-01', 208, 'Completed', 4.7, 7, 'A young shepherd follows his dreams and destiny across the world.'),

('9780590353427', 'Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 'hp_sorcerers_stone.jpg', 'Harry Potter', 'Fantasy', '1997-06-26', 309, 'Completed', 4.9, 9, 'Harry discovers he is a wizard and attends Hogwarts School of Witchcraft and Wizardry.');



INSERT INTO books (isbn, title, author, cover_image, series, genre_ship, publish_complete_date, pages_words, read_status, rating, hours_to_read, description) 
VALUES 
('9781250301697', 'The Silent Patient', 'Alex Michaelides', 'the_silent_patient.jpg', NULL, 'Psychological Thriller', '2019-02-05', 325, 'Completed', 4.2, 10, 'A woman shoots her husband and then refuses to speak. A psychotherapist tries to uncover the truth.'),

('9781982137865', 'The Midnight Library', 'Matt Haig', 'midnight_library.jpg', NULL, 'Fantasy', '2020-08-13', 288, 'Completed', 4.3, 9, 'A woman explores alternate lives in a library that exists between life and death.'),

('9780593437166', 'Fourth Wing', 'Rebecca Yarros', 'fourth_wing.jpg', NULL, 'Fantasy', '2023-05-02', 512, 'Completed', 4.6, 15, 'A young woman joins a dangerous military academy where dragons and magic intertwine.'),

('9781524798659', 'Daisy Jones & The Six', 'Taylor Jenkins Reid', 'daisy_jones.jpg', NULL, 'Historical Fiction', '2019-03-05', 368, 'Completed', 4.6, 11, 'A fictional oral history of a 1970s rock band and the rise and fall of its members.'),

('9780765387561', 'The Invisible Life of Addie LaRue', 'V.E. Schwab', 'invisible_life_of_addie_larue.jpg', NULL, 'Fantasy', '2020-10-06', 442, 'Completed', 4.4, 13, 'A woman makes a deal to live forever, but no one remembers her.'),

('9780593106247', 'The Love Hypothesis', 'Ali Hazelwood', 'love_hypothesis.jpg', NULL, 'Romance', '2021-09-14', 384, 'Completed', 4.2, 11, 'A Ph.D. student pretends to be in a relationship with a professor to save face, but their fake romance becomes real.'),

('9781501133370', 'It Starts With Us', 'Colleen Hoover', 'it_starts_with_us.jpg', NULL, 'Romance', '2022-10-18', 336, 'Completed', 4.6, 10, 'The continuation of the love story between Lily Bloom and Atlas Corrigan.'),

('9780062868677', 'The Guest List', 'Lucy Foley', 'the_guest_list.jpg', NULL, 'Thriller', '2020-02-20', 384, 'Completed', 4.2, 11, 'A wedding on a remote island turns deadly when secrets are revealed.'),

('9781542025882', 'The Housemaid', 'Freida McFadden', 'housemaid.jpg', NULL, 'Thriller', '2022-01-15', 368, 'Completed', 4.5, 10, 'A woman gets a job as a housemaid in a wealthy family, but she uncovers dark secrets.'),

('9780385548011', 'Lessons in Chemistry', 'Bonnie Garmus', 'lessons_in_chemistry.jpg', NULL, 'Historical Fiction', '2022-04-05', 400, 'Completed', 4.5, 12, 'A female chemist in the 1960s becomes a TV cooking star while challenging societal expectations.'),

('9780770480652', 'Reminders of Him', 'Colleen Hoover', 'reminders_of_him.jpg', NULL, 'Romance', '2022-01-18', 384, 'Completed', 4.4, 11, 'A man tries to regain the trust of his estranged son after serving time in prison.'),

('9780593456792', 'Book Lovers', 'Emily Henry', 'book_lovers.jpg', NULL, 'Romance', '2022-05-03', 400, 'Completed', 4.3, 11, 'A literary agent and a book editor fall in love while visiting a small town.'),

('9781635573898', 'A Court of Silver Flames', 'Sarah J. Maas', 'court_of_silver_flames.jpg', 'A Court of Thorns and Roses', 'Fantasy', '2021-02-16', 757, 'Completed', 4.6, 20, 'The story of Nesta and Cassian’s romance after the events of *A Court of Thorns and Roses*.'),

('9781524738627', 'Malibu Rising', 'Taylor Jenkins Reid', 'malibu_rising.jpg', NULL, 'Historical Fiction', '2021-06-01', 400, 'Completed', 4.4, 12, 'A summer party in Malibu ends in a fire, and the secrets of a famous family are revealed.'),

('9780593353513', 'Tomorrow, and Tomorrow, and Tomorrow', 'Gabrielle Zevin', 'tomorrow_and_tomorrow.jpg', NULL, 'Literary Fiction', '2022-07-05', 432, 'Completed', 4.3, 13, 'Two friends navigate their careers as video game designers over several decades.'),

('9781250244934', 'Red, White & Royal Blue', 'Casey McQuiston', 'red_white_royal_blue.jpg', NULL, 'Romance', '2019-05-14', 421, 'Completed', 4.6, 12, 'The son of the U.S. president and a British prince fall in love amidst political scandal.'),

('9780385688030', 'The Last Thing He Told Me', 'Laura Dave', 'last_thing_he_told_me.jpg', NULL, 'Thriller', '2021-05-04', 368, 'Completed', 4.3, 11, 'A woman tries to uncover the truth behind her husband’s mysterious disappearance.');


INSERT INTO books (isbn, title, author, cover_image, series, genre_ship, publish_complete_date, pages_words, read_status, rating, hours_to_read, description) 
VALUES 
('9780399580380', 'People We Meet on Vacation', 'Emily Henry', 'people_we_meet_on_vacation.jpg', NULL, 'Romance', '2021-05-11', 368, 'Completed', 4.3, 11, 'Two friends who once vacationed together attempt to rekindle their relationship.'),

('9780593336783', 'Beach Read', 'Emily Henry', 'beach_read.jpg', NULL, 'Romance', '2020-05-19', 384, 'Completed', 4.3, 10, 'A romance between two writers with opposing styles of writing.'),

('9780316524035', 'A Good Girl"s Guide to Murder', 'Holly Jackson', 'good_girls_guide.jpg', NULL, 'Mystery', '2019-02-08', 400, 'Completed', 4.4, 12, 'A high school student investigates a closed murder case for her senior project.');


SELECT * FROM books WHERE isbn = '9780061120084';

INSERT INTO books (isbn, title, author, cover_image, series, genre_ship, publish_complete_date, pages_words, read_status, rating, hours_to_read, description) 
VALUES 
('9780593441272', 'Happy Place', 'Emily Henry', 'happy_place.jpg', NULL, 'Romance', '2023-04-25', 400, 'Completed', 4.3, 12, 'A couple who secretly broke up pretends to still be together during a vacation with friends.'),

('9781668002834', 'I"m Glad My Mom Died', 'Jennette McCurdy', 'im_glad_my_mom_died.jpg', NULL, 'Memoir', '2022-08-09', 320, 'Completed', 4.7, 10, 'A raw and emotional memoir about child stardom, abuse, and self-discovery.'),

('9781649374172', 'Iron Flame', 'Rebecca Yarros', 'iron_flame.jpg', NULL, 'Fantasy', '2023-11-07', 640, 'Completed', 4.6, 19, 'The sequel to *Fourth Wing*, continuing the story of Violet and her dragon academy trials.'),

('9781728276113', 'Things We Never Got Over', 'Lucy Score', 'things_we_never_got_over.jpg', NULL, 'Romance', '2022-01-12', 572, 'Completed', 4.4, 17, 'A runaway bride ends up in a small town with a grumpy stranger who wants nothing to do with her.'),

('9781635574048', 'House of Earth and Blood', 'Sarah J. Maas', 'house_of_earth_and_blood.jpg', 'Crescent City', 'Fantasy', '2020-03-03', 816, 'Completed', 4.5, 22, 'A half-Fae investigates a supernatural murder in a world of magic, politics, and secrets.'),

('9781984806741', 'The Unhoneymooners', 'Christina Lauren', 'unhoneymooners.jpg', NULL, 'Romance', '2019-05-14', 400, 'Completed', 4.2, 12, 'Two enemies are forced to take a honeymoon together after a wedding disaster leaves them the only ones standing.'),

('9781728274867', 'Twisted Love', 'Ana Huang', 'twisted_love.jpg', 'Twisted', 'Romance', '2021-04-27', 368, 'Completed', 4.2, 11, 'A dark and angsty romance between a brooding billionaire and his best friend’s sister.'),

('9780759555402', 'The Inheritance Games', 'Jennifer Lynn Barnes', 'inheritance_games.jpg', NULL, 'Mystery', '2020-09-01', 384, 'Completed', 4.5, 12, 'A girl inherits a billionaire’s fortune, but must solve deadly riddles to claim it.'),

('9780525536291', 'The Vanishing Half', 'Brit Bennett', 'vanishing_half.jpg', NULL, 'Historical Fiction', '2020-06-02', 352, 'Completed', 4.4, 11, 'Twin sisters take different paths—one passing as white, the other living in their Black hometown.'),

('9781952457463', 'From Blood and Ash', 'Jennifer L. Armentrout', 'from_blood_and_ash.jpg', NULL, 'Fantasy', '2020-03-30', 613, 'Completed', 4.3, 18, 'A young woman destined for greatness falls for the forbidden guard protecting her.'),

('9780593337117', 'Icebreaker', 'Hannah Grace', 'icebreaker.jpg', NULL, 'Romance', '2022-08-23', 432, 'Completed', 4.2, 13, 'A figure skater and a hockey player must learn to work together despite their differences.'),

('9781339003788', 'The Ballad of Songbirds and Snakes', 'Suzanne Collins', 'ballad_of_songbirds_and_snakes.jpg', 'The Hunger Games', 'Dystopian', '2020-05-19', 528, 'Completed', 4.3, 16, 'The origin story of President Snow and his role in the 10th Hunger Games.'),

('9781250217310', 'The House in the Cerulean Sea', 'TJ Klune', 'house_in_cerulean_sea.jpg', NULL, 'Fantasy', '2020-03-17', 400, 'Completed', 4.6, 12, 'A heartwarming tale of found family and acceptance set in a magical orphanage.'),

('9780593336158', 'The Maid', 'Nita Prose', 'the_maid.jpg', NULL, 'Mystery', '2022-01-04', 304, 'Completed', 4.3, 9, 'A socially awkward hotel maid finds herself entangled in a murder mystery.'),

('9781668021637', 'The Spanish Love Deception', 'Elena Armas', 'spanish_love_deception.jpg', NULL, 'Romance', '2021-02-23', 480, 'Completed', 4.3, 14, 'A woman brings a fake boyfriend to her sister’s wedding in Spain.'),

('9781668000236', 'The Perfect Marriage', 'Jeneva Rose', 'perfect_marriage.jpg', NULL, 'Thriller', '2020-07-03', 344, 'Completed', 4.1, 10, 'A top defense attorney’s husband is accused of murder. Is he guilty?'),

('9780063204160', 'Remarkably Bright Creatures', 'Shelby Van Pelt', 'remarkably_bright_creatures.jpg', NULL, 'Literary Fiction', '2022-05-03', 368, 'Completed', 4.5, 11, 'An unlikely friendship between a widow and a giant Pacific octopus leads to a surprising mystery.'),

('9780063251928', 'Yellowface', 'R.F. Kuang', 'yellowface.jpg', NULL, 'Literary Fiction', '2023-05-16', 336, 'Completed', 4.2, 10, 'A white author steals the manuscript of her late Asian friend and publishes it as her own.'),

('9781250178604', 'The Four Winds', 'Kristin Hannah', 'four_winds.jpg', NULL, 'Historical Fiction', '2021-02-02', 464, 'Completed', 4.4, 14, 'A woman struggles to survive the Dust Bowl and Great Depression in 1930s America.'),

('9781542016422', 'Regretting You', 'Colleen Hoover', 'regretting_you.jpg', NULL, 'Romance', '2019-12-10', 368, 'Completed', 4.3, 11, 'A mother and daughter navigate grief and love after an unexpected tragedy.'),

('9780316310331', 'The Wicked King', 'Holly Black', 'wicked_king.jpg', 'The Folk of the Air', 'Fantasy', '2019-01-08', 336, 'Completed', 4.5, 10, 'The dangerous romance between Jude and Cardan continues in this dark faerie world.'),

('9781957635002', 'Haunting Adeline', 'H.D. Carlton', 'haunting_adeline.jpg', NULL, 'Dark Romance', '2021-08-13', 576, 'Completed', 4.2, 16, 'A writer moves into a haunted mansion and attracts the attention of a dangerous stalker.'),

('9781538724743', 'The Housemaid"s Secret', 'Freida McFadden', 'housemaids_secret.jpg', NULL, 'Thriller', '2023-02-20', 336, 'Completed', 4.4, 10, 'A housemaid discovers horrifying secrets in her new employer’s home.'),

('9780593135200', 'Project Hail Mary', 'Andy Weir', 'project_hail_mary.jpg', NULL, 'Science Fiction', '2021-05-04', 496, 'Completed', 4.7, 15, 'An astronaut wakes up alone on a spaceship with no memory and must save humanity.'),

('9781804991338', 'None of This Is True', 'Lisa Jewell', 'none_of_this_is_true.jpg', NULL, 'Thriller', '2023-07-20', 384, 'Completed', 4.3, 11, 'A podcaster meets a woman who claims to be her twin, leading to a dark mystery.'),

('9780063040751', 'American Dirt', 'Jeanine Cummins', 'american_dirt.jpg', NULL, 'Literary Fiction', '2020-01-21', 400, 'Completed', 4.3, 12, 'A Mexican woman and her son flee to the U.S. after a cartel massacre.'),

('9780525541905', 'Crying in H Mart', 'Michelle Zauner', 'crying_in_h_mart.jpg', NULL, 'Memoir', '2021-04-20', 256, 'Completed', 4.6, 8, 'A memoir about food, family, and grief from the lead singer of Japanese Breakfast.');


INSERT INTO books (isbn, title, author, cover_image, series, genre_ship, publish_complete_date, pages_words, read_status, rating, hours_to_read, description) 
VALUES  
('9780375869020', 'Wonder', 'R.J. Palacio', 'wonder.jpg', NULL, 'Contemporary', '2012-02-14', 320, 'Completed', 4.5, 10, 'A young boy with a facial difference navigates his first year at a mainstream school, teaching kindness and empathy along the way.');

INSERT INTO books (isbn, title, author, cover_image, series, genre_ship, publish_complete_date, pages_words, read_status, rating, hours_to_read, description) 
VALUES  
('9780316479267', 'The Wild Robot Escapes', 'Peter Brown', 'the_wild_robot_escapes.jpg', 'The Wild Robot', 'Science Fiction', '2018-03-13', 288, 'Completed', 4.4, 8, 'Roz, a robot, must escape from civilization and find her way back to the wild and her adopted animal family.');

