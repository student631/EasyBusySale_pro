const pool = require('../config/database');
const Advertisement = require('../models/Advertisement');
const bcrypt = require('bcrypt');

// Sample realistic ad data based on Kijiji.ca categories
const sampleAds = [
  // Electronics
  {
    title: "iPhone 14 Pro Max 256GB - Space Black",
    description: "Like new iPhone 14 Pro Max in space black. Purchased 3 months ago, comes with original box, charger, and earbuds. No scratches or damage, always used with screen protector and case. Battery health at 98%. Selling because upgrading to newer model.",
    price: 1200,
    category: "Electronics",
    location: "Toronto, Ontario",
    condition_type: "like-new",
    images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"],
    contact_phone: "+14165551234",
    contact_email: "john.toronto@email.com"
  },
  {
    title: "MacBook Pro 14\" M2 Pro 16GB RAM 512GB SSD",
    description: "2023 MacBook Pro with M2 Pro chip. 16GB unified memory, 512GB SSD. Used for light work, no heavy tasks. Comes with original charger and box. Perfect condition, no issues at all. Great for students or professionals.",
    price: 2100,
    category: "Electronics",
    location: "Vancouver, British Columbia",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop"],
    contact_phone: "+16047781234",
    contact_email: "sarah.van@email.com"
  },
  {
    title: "Sony PlayStation 5 Console with Extra Controller",
    description: "PS5 console with one extra DualSense controller. Includes Spider-Man: Miles Morales and Ratchet & Clank: Rift Apart. Console is in excellent condition, runs perfectly. All cables included. No trades, cash only.",
    price: 650,
    category: "Electronics",
    location: "Calgary, Alberta",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop"],
    contact_phone: "+14032223456",
    contact_email: "mike.calgary@email.com"
  },
  // Vehicles
  {
    title: "2020 Toyota Camry SE - Low KM",
    description: "2020 Toyota Camry SE with only 35,000 km. One owner, regularly serviced at Toyota dealership. No accidents, clean title. Features include: backup camera, touch screen audio, sport-tuned suspension, LED headlights. Runs perfectly, selling because moving overseas.",
    price: 28500,
    category: "Cars & Vehicles",
    location: "Montreal, Quebec",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1554224712-d8560f709cbe?w=400&h=300&fit=crop"],
    contact_phone: "+15145551234",
    contact_email: "pierre.mtl@email.com"
  },
  {
    title: "2019 Honda CR-V EX-L AWD",
    description: "2019 Honda CR-V EX-L with 45,000 km. Excellent condition, regular maintenance, no accidents. Comes with all-weather mats, cargo cover, and Honda accessory package. Features: leather seats, sunroof, heated seats, Apple CarPlay/Android Auto. AWD perfect for Canadian winters.",
    price: 32500,
    category: "Cars & Vehicles",
    location: "Edmonton, Alberta",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&h=300&fit=crop"],
    contact_phone: "+17804445678",
    contact_email: "jennifer.edmonton@email.com"
  },
  // Furniture
  {
    title: "Solid Wood Dining Table Set - 6 Chairs",
    description: "Beautiful solid oak dining table with 6 matching chairs. Table dimensions: 72\" x 36\" x 30\". Chairs have beige fabric seats. Very sturdy construction, minor surface scratches that add character. Purchased for $2000, asking much less. Must pick up, moving sale.",
    price: 650,
    category: "Furniture",
    location: "Ottawa, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&fit=crop"],
    contact_phone: "+16139991234",
    contact_email: "david.ottawa@email.com"
  },
  {
    title: "IKEA Kallax Shelf Unit - White",
    description: "IKEA Kallax 4x4 shelving unit in white. Great condition, no damage. Perfect for books, storage, or room divider. Comes with assembly instructions. Easy to disassemble for transport. Dimensions: 57\" x 57\" x 15\". Smoke-free home.",
    price: 60,
    category: "Furniture",
    location: "Winnipeg, Manitoba",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1594026112284-02bb6bb3364f?w=400&h=300&fit=crop"],
    contact_phone: "+12043334567",
    contact_email: "lisa.wpg@email.com"
  },
  // Home & Garden
  {
    title: "Black+Decker Lawn Mower - Electric",
    description: "Black+Decker 20V Max cordless lawn mower. 16\" cutting width, 3-in-1 function (mulch, bag, side discharge). Battery and charger included. Used for one season, works perfectly. Great for small to medium yards. Selling because moving to condo.",
    price: 150,
    category: "Home & Garden",
    location: "Halifax, Nova Scotia",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1589216459222-6c072f65e522?w=400&h=300&fit=crop"],
    contact_phone: "+19024561234",
    contact_email: "robert.halifax@email.com"
  },
  {
    title: "Complete BBQ Set with Propane Tank",
    description: "Complete BBQ set including: propane grill, side burner, temperature gauge, tool set, cover, and nearly full propane tank. Grill has 4 main burners + infrared side burner. Perfect for summer cooking. Well maintained, clean grates. Moving to apartment complex with BBQ ban.",
    price: 300,
    category: "Home & Garden",
    location: "Victoria, British Columbia",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop"],
    contact_phone: "+12505557890",
    contact_email: "amanda.victoria@email.com"
  },
  // Sports & Fitness
  {
    title: "Bowflex Adjustable Dumbbells - Pair",
    description: "Bowflex SelectTech 552 adjustable dumbbells (5-52.5 lbs each). Like new condition, used less than 20 times. Comes with stand. Perfect for home gym, saves space. Selling because joining commercial gym. Original price $600, asking half.",
    price: 300,
    category: "Sports & Fitness",
    location: "Quebec City, Quebec",
    condition_type: "like-new",
    images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"],
    contact_phone: "+14186661234",
    contact_email: "marc.qc@email.com"
  },
  {
    title: "Treadmill - ProForm Performance 600i",
    description: "ProForm Performance 600i treadmill with incline training, iFit compatibility, and 20 built-in workouts. Large running surface, cushioned deck, built-in fan. Excellent condition, works perfectly. Selling due to injury preventing running. Must be able to move.",
    price: 800,
    category: "Sports & Fitness",
    location: "Saskatoon, Saskatchewan",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"],
    contact_phone: "+13069991234",
    contact_email: "kevin.saskatoon@email.com"
  },
  // Fashion & Accessories
  {
    title: "Canada Goose Expedition Parka - Men's Large",
    description: "Authentic Canada Goose Expedition Parka in black, size Large. Purchased last winter for $950+tax. Excellent condition, professionally cleaned. No rips, tears, or stains. All fur is intact, zippers work perfectly. Selling because moving to warmer climate. Serious buyers only.",
    price: 600,
    category: "Fashion",
    location: "Regina, Saskatchewan",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400&h=300&fit=crop"],
    contact_phone: "+13067774567",
    contact_email: "stephanie.regina@email.com"
  },
  {
    title: "Michael Kors Handbag Collection",
    description: "Collection of 3 authentic Michael Kors handbags: Jet Set Tote, Selma Satchel, and Mercer Crossbody. All in excellent condition, barely used. Comes with dust bags and authenticity cards. Black and brown colors, perfect for professional women. Original value over $800.",
    price: 350,
    category: "Fashion",
    location: "London, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1584917845444-7066b9253441?w=400&h=300&fit=crop"],
    contact_phone: "+15196667890",
    contact_email: "emily.london@email.com"
  },
  // Books & Media
  {
    title: "Complete Harry Potter Hardcover Collection",
    description: "Complete set of Harry Potter books in hardcover. All 7 books in excellent condition. US first editions, no writing or damage. Dust jackets intact. Perfect for collectors or young readers. Selling as set only, will not separate. Local pickup preferred.",
    price: 120,
    category: "Books",
    location: "Hamilton, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop"],
    contact_phone: "+19058881234",
    contact_email: "alex.hamilton@email.com"
  },
  {
    title: "Vintage Vinyl Record Collection - 200+ Albums",
    description: "Huge collection of vintage vinyl records from 60s-80s. Rock, pop, jazz, blues genres. Artists include Beatles, Rolling Stones, Pink Floyd, Led Zeppelin, Bob Dylan, Miles Davis. All records in playable condition, sleeves range from good to excellent. Must see to appreciate.",
    price: 800,
    category: "Music",
    location: "Kitchener, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1565372195514-5d3b9e7d8a1d?w=400&h=300&fit=crop"],
    contact_phone: "+15194445678",
    contact_email: "david.kitchener@email.com"
  },
  // Baby & Kids
  {
    title: "Graco Pack 'n Play Playard with Accessories",
    description: "Graco Pack 'n Play with newborn napper station, changing table, and bassinet. Comes with mobile, storage organizer, and travel bag. Used for one child, in excellent condition. All fabrics removable and machine washable. Perfect for grandparents' house or travel.",
    price: 100,
    category: "Baby & Kids",
    location: "Guelph, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop"],
    contact_phone: "+15198881234",
    contact_email: "jennifer.guelph@email.com"
  },
  {
    title: "LEGO City Collection - Multiple Sets",
    description: "Large LEGO collection including: Police Station, Fire Station, Airport, Train Set, and various vehicles. All sets complete with instructions and minifigures. Over 5000 pieces total. Great for imaginative play. Selling because kids outgrew them. Worth over $600 new.",
    price: 300,
    category: "Toys & Games",
    location: "Windsor, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1584917845444-7066b9253441?w=400&h=300&fit=crop"],
    contact_phone: "+15197774567",
    contact_email: "mark.windsor@email.com"
  },
  // More sample ads to reach 100-200 total
  {
    title: "Samsung 55\" 4K Smart TV - QLED",
    description: "Samsung Q60A 55\" 4K QLED Smart TV. Excellent picture quality, smart features, multiple HDMI ports. Remote control included. No dead pixels, perfect condition. Selling because upgrading to larger screen. Original price $799+tax.",
    price: 450,
    category: "Electronics",
    location: "Burnaby, British Columbia",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1593784997457-395e0e4b5c5e?w=400&h=300&fit=crop"],
    contact_phone: "+16046667890",
    contact_email: "chris.burnaby@email.com"
  },
  {
    title: "Professional Camera Bundle - Canon EOS R5",
    description: "Canon EOS R5 mirrorless camera with 24-70mm f/2.8 lens, extra battery, memory cards, and professional camera bag. Like new condition, under 1000 shutter count. Perfect for professional photographers or serious enthusiasts. Over $6000 invested.",
    price: 4200,
    category: "Electronics",
    location: "Mississauga, Ontario",
    condition_type: "like-new",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"],
    contact_phone: "+19059991234",
    contact_email: "professional.photo@email.com"
  },
  {
    title: "Electric Guitar Package - Fender Stratocaster",
    description: "Fender Player Stratocaster with amplifier, cables, stand, tuner, and beginner book. Mexican made, excellent condition. Perfect for beginners or intermediate players. Great tone, plays perfectly. Selling because switching to bass guitar.",
    price: 400,
    category: "Music",
    location: "Brampton, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1527838832700-5059252407fa?w=400&h=300&fit=crop"],
    contact_phone: "+19058885678",
    contact_email: "guitar.player@email.com"
  },
  {
    title: "Mountain Bike - Trek Marlin 7",
    description: "Trek Marlin 7 mountain bike, size M. 29\" wheels, 21 speeds, hydraulic disc brakes. Excellent condition, regularly serviced. Perfect for trails or commuting. Includes helmet, lock, and repair kit. Selling because moving to city without good biking infrastructure.",
    price: 450,
    category: "Sports & Fitness",
    location: "Vaughan, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1576201836106-db1758d1c5f1?w=400&h=300&fit=crop"],
    contact_phone: "+19057779012",
    contact_email: "cyclist.vaughan@email.com"
  },
  {
    title: "Complete Bedroom Set - Queen Size",
    description: "Complete bedroom set including: queen bed frame with storage, nightstands, dresser, and mirror. Modern style, espresso finish. Solid wood construction, very sturdy. Like new condition, barely used. Moving to furnished apartment, must sell. Worth over $2000 new.",
    price: 850,
    category: "Furniture",
    location: "Richmond Hill, Ontario",
    condition_type: "like-new",
    images: ["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=300&fit=crop"],
    contact_phone: "+19056663456",
    contact_email: "furniture.rh@email.com"
  },
  {
    title: "Kitchen Appliance Package - Stainless Steel",
    description: "Complete stainless steel appliance package: refrigerator, stove, dishwasher, and microwave. All Samsung, 2 years old, excellent condition. Energy efficient, all manuals included. Selling because renovating kitchen with different style. Worth over $4000 new.",
    price: 2200,
    category: "Appliances",
    location: "Markham, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=300&fit=crop"],
    contact_phone: "+19059998765",
    contact_email: "kitchen.markham@email.com"
  },
  {
    title: "Designer Watch Collection - Luxury Brands",
    description: "Collection of 3 authentic luxury watches: Rolex Submariner, Omega Seamaster, and Tag Heuer Carrera. All authentic with boxes and papers. Regularly serviced, perfect condition. Must sell for emergency. Serious inquiries only, proof of funds required.",
    price: 15000,
    category: "Fashion",
    location: "Toronto, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1523170335962-b7fd6d00d4b4?w=400&h=300&fit=crop"],
    contact_phone: "+14165550000",
    contact_email: "luxury.watches@email.com"
  },
  {
    title: "Office Chair - Herman Miller Aeron",
    description: "Herman Miller Aeron office chair, size B. Classic design, excellent condition. Fully adjustable with lumbar support. Perfect for home office. Selling because company provided new chair. Original price $1200+. Local pickup only, cash or e-transfer accepted.",
    price: 650,
    category: "Office Furniture",
    location: "Downtown Toronto, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"],
    contact_phone: "+14161112222",
    contact_email: "office.chair@email.com"
  },
  {
    title: "Professional Tools - DeWalt Combo Kit",
    description: "DeWalt 20V Max combo kit including: drill, impact driver, circular saw, reciprocating saw, grinder, and flashlight. Comes with 4 batteries, charger, and large tool bag. All tools work perfectly, batteries hold great charge. Professional grade, worth over $1000 new.",
    price: 600,
    category: "Tools",
    location: "Etobicoke, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1581091226825-a6a3a5b81455?w=400&h=300&fit=crop"],
    contact_phone: "+14163334444",
    contact_email: "tools.etobicoke@email.com"
  },
  {
    title: "Snowblower - Toro 2-Stage",
    description: "Toro Power Max 826 OE 2-stage snowblower. 26\" clearing width, electric start, power steering. Excellent condition, well maintained. Perfect for Canadian winters. Selling because moving to condo. Used only 3 seasons, runs perfectly.",
    price: 750,
    category: "Outdoor Equipment",
    location: "Scarborough, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop"],
    contact_phone: "+14165556666",
    contact_email: "snowblower.scarborough@email.com"
  },
  {
    title: "Gaming PC Setup - High Performance",
    description: "Custom gaming PC with Intel i7, RTX 3080, 32GB RAM, 1TB NVMe SSD. 27\" 1440p 165Hz monitor, mechanical keyboard, gaming mouse, and headset. All components top-tier, plays any game max settings. Selling because focusing on career change. Worth over $3500.",
    price: 2200,
    category: "Electronics",
    location: "North York, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1593640408182-31c700c11b73?w=400&h=300&fit=crop"],
    contact_phone: "+14167778888",
    contact_email: "gaming.pc@email.com"
  },
  {
    title: "Vintage Furniture Collection - Mid-Century Modern",
    description: "Authentic mid-century modern furniture collection including: Eames lounge chair, Noguchi coffee table, and teak sideboard. All pieces restored to excellent condition. Original or high-quality reproductions. Perfect for vintage enthusiasts. Museum quality pieces.",
    price: 5000,
    category: "Furniture",
    location: "Yorkville, Toronto",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=300&fit=crop"],
    contact_phone: "+14169990000",
    contact_email: "vintage.furniture@email.com"
  },
  {
    title: "Complete Aquarium Setup - 75 Gallon",
    description: "75 gallon aquarium with stand, canopy, filter, heater, LED lights, and decorations. Established freshwater setup with healthy community fish. Easy to maintain, peaceful aquarium. Selling because moving across country. All equipment less than 2 years old.",
    price: 800,
    category: "Pets",
    location: "East York, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop"],
    contact_phone: "+14164445555",
    contact_email: "aquarium.setup@email.com"
  },
  {
    title: "Winter Sports Equipment - Complete Set",
    description: "Complete winter sports package: Rossignol skis with bindings, Salomon boots, poles, ski helmet, and ski bag. Also includes snowboard, boots, and bindings. All equipment excellent condition, regularly serviced. Sizes: Men's 9 boots, 170cm skis, 156cm snowboard.",
    price: 1200,
    category: "Sports & Fitness",
    location: "Barrie, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"],
    contact_phone: "+17053336666",
    contact_email: "winter.sports@email.com"
  },
  {
    title: "Camping Gear - Complete Setup",
    description: "Complete camping setup for 4-6 people: Large tent, sleeping bags, air mattresses, camping stove, lanterns, cooler, and cooking utensils. Everything needed for outdoor adventures. All equipment clean and in working condition. Used for 3 camping trips only.",
    price: 500,
    category: "Outdoor Recreation",
    location: "Oakville, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop"],
    contact_phone: "+19058887777",
    contact_email: "camping.gear@email.com"
  },
  {
    title: "Yoga & Fitness Equipment Bundle",
    description: "Complete home fitness setup: Lululemon yoga mat, blocks, straps, resistance bands, foam roller, and 3 yoga DVDs. Also includes adjustable dumbbells (5-25 lbs) and exercise ball. Everything in excellent condition, clean and well maintained. Perfect for home workouts.",
    price: 200,
    category: "Sports & Fitness",
    location: "Burlington, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop"],
    contact_phone: "+19057776666",
    contact_email: "yoga.fitness@email.com"
  },
  {
    title: "Professional Photography Lighting Kit",
    description: "Complete studio lighting kit: 3 softboxes, 2 umbrellas, backdrop stand with 4 backdrops, and wireless triggers. Perfect for portrait or product photography. All equipment works perfectly, includes carrying cases. Selling because focusing on outdoor photography only.",
    price: 400,
    category: "Electronics",
    location: "Milton, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1543857778-c4a1a569e7bd?w=400&h=300&fit=crop"],
    contact_phone: "+19059998888",
    contact_email: "studio.lighting@email.com"
  },
  {
    title: "Antique Collection - Vintage Items",
    description: "Collection of antique items including: Victorian porcelain dolls, pocket watches, silverware, and decorative items. All pieces authentic and in good condition. Some over 100 years old. Perfect for collectors or vintage home decor. Can sell individually or as complete set.",
    price: 1500,
    category: "Antiques",
    location: "Georgetown, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"],
    contact_phone: "+19058884444",
    contact_email: "antique.collection@email.com"
  },
  {
    title: "Complete DJ Equipment Setup",
    description: "Professional DJ setup: Pioneer DDJ-SX3 controller, KRK Rokit 5 studio monitors, headphones, and stand. Perfect for beginners or experienced DJs. All equipment excellent condition, well maintained. Includes software and cables. Selling because focusing on music production.",
    price: 1200,
    category: "Music",
    location: "Ajax, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop"],
    contact_phone: "+19056667777",
    contact_email: "dj.equipment@email.com"
  },
  {
    title: "Art Supplies Collection - Professional Grade",
    description: "Large collection of professional art supplies: Winsor & Newton oil paints, various brushes, canvases, easel, drawing materials, and portfolio case. Perfect for serious artists or art students. Over $2000 value, all supplies in excellent condition. Selling because changing mediums.",
    price: 800,
    category: "Art & Crafts",
    location: "Pickering, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1547896035-b3a9e9b9a4a8?w=400&h=300&fit=crop"],
    contact_phone: "+19057775555",
    contact_email: "art.supplies@email.com"
  },
  {
    title: "Pet Supplies - Complete Package",
    description: "Complete pet package for medium to large dogs: Crate, bed, food/water bowls, toys, grooming supplies, leashes, and training equipment. All items clean and in good condition. Includes premium food containers and treat storage. Perfect for new pet owners. Moving overseas must sell.",
    price: 150,
    category: "Pets",
    location: "Whitby, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1450778869180-0d5652dc8ea5?w=400&h=300&fit=crop"],
    contact_phone: "+19056668888",
    contact_email: "pet.supplies@email.com"
  },
  {
    title: "Garden Tools & Equipment - Complete Set",
    description: "Complete gardening set: Lawn mower, trimmer, leaf blower, hedge trimmer, wheelbarrow, and various hand tools. All equipment gas-powered and well-maintained. Perfect for home garden maintenance. Selling because moving to townhouse with landscaping service.",
    price: 600,
    category: "Home & Garden",
    location: "Oshawa, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1589216459222-6c072f65e522?w=400&h=300&fit=crop"],
    contact_phone: "+19057779999",
    contact_email: "garden.tools@email.com"
  },
  {
    title: "Sewing Machine - Industrial Grade",
    description: "Juki industrial sewing machine, model DDL-8700. Perfect for professional sewing or heavy-duty projects. Single needle, lockstitch, high speed. Well maintained, recently serviced. Comes with table and motor. Selling because closing custom sewing business.",
    price: 800,
    category: "Crafts & Hobbies",
    location: "Clarington, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1581091226825-a6a3a5b81455?w=400&h=300&fit=crop"],
    contact_phone: "+19058883333",
    contact_email: "sewing.machine@email.com"
  },
  {
    title: "Complete Home Gym Package",
    description: "Complete home gym setup: Power rack with pull-up bar, Olympic barbell set (300lbs), adjustable dumbbells, bench, and various accessories. All equipment commercial grade, excellent condition. Perfect for serious strength training. Worth over $3000 new.",
    price: 1800,
    category: "Sports & Fitness",
    location: "Bowmanville, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"],
    contact_phone: "+19056661111",
    contact_email: "home.gym@email.com"
  },
  {
    title: "Vintage Audio Equipment - Audiophile Grade",
    description: "Vintage audio equipment collection: Marantz receiver, Technics turntable, JBL speakers, and Pioneer cassette deck. All equipment restored to excellent condition. Perfect sound quality, classic warm tone. Comes with vintage vinyl collection. Audiophile dream setup.",
    price: 2500,
    category: "Electronics",
    location: "Cobourg, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop"],
    contact_phone: "+19058882222",
    contact_email: "vintage.audio@email.com"
  },
  {
    title: "Professional Chef Knife Set",
    description: "Complete professional knife set: Wusthof Classic knives including chef, santoku, bread, paring, and utility knives. Includes knife block, honing steel, and sharpening stone. All knives professionally sharpened and maintained. Perfect for serious home cooks or culinary students.",
    price: 400,
    category: "Kitchen",
    location: "Port Hope, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop"],
    contact_phone: "+19057774444",
    contact_email: "chef.knives@email.com"
  },
  {
    title: "Complete Fishing Equipment Setup",
    description: "Complete fishing setup for freshwater fishing: Medium-heavy rods, reels, tackle box with lures, nets, and accessories. Also includes portable fish finder and waterproof storage. Perfect for bass, pike, and walleye fishing. All equipment in excellent condition.",
    price: 500,
    category: "Outdoor Recreation",
    location: "Belleville, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=300&fit=crop"],
    contact_phone: "+16139693333",
    contact_email: "fishing.gear@email.com"
  },
  {
    title: "Vintage Camera Collection",
    description: "Collection of vintage film cameras: Canon AE-1, Nikon FM, and Olympus OM-1. All cameras in working condition with lenses. Also includes darkroom equipment and supplies. Perfect for film photography enthusiasts or collectors. Classic pieces of photographic history.",
    price: 600,
    category: "Photography",
    location: "Kingston, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"],
    contact_phone: "+16135442222",
    contact_email: "vintage.cameras@email.com"
  },
  {
    title: "Complete Baby Furniture Set",
    description: "Complete nursery furniture set: Crib (convertible to toddler bed), dresser with changing table, glider rocker, and bookshelf. All furniture solid wood, excellent condition. Non-toxic finish, meets all safety standards. Perfect for new parents. Selling because kids outgrew.",
    price: 800,
    category: "Baby & Kids",
    location: "Napanee, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop"],
    contact_phone: "+16138771111",
    contact_email: "baby.furniture@email.com"
  },
  {
    title: "Professional Power Tools - DeWalt",
    description: "Complete DeWalt power tool set: Table saw, miter saw, circular saw, jigsaw, sander, and router. All 20V Max with batteries and charger. Perfect for woodworking or construction projects. All tools excellent condition, well-maintained. Worth over $2000 new.",
    price: 1200,
    category: "Tools",
    location: "Trenton, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1581091226825-a6a3a5b81455?w=400&h=300&fit=crop"],
    contact_phone: "+16133964444",
    contact_email: "power.tools@email.com"
  },
  {
    title: "Vintage Sports Memorabilia Collection",
    description: "Collection of vintage sports memorabilia: Signed hockey pucks, baseball cards, jerseys, and photos. Items from 1970s-1990s. All authentic with certificates of authenticity. Perfect for sports fans or collectors. Includes items from Maple Leafs, Canadiens, and Blue Jays.",
    price: 2000,
    category: "Collectibles",
    location: "Peterborough, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1540747933326-1e5cfc278915?w=400&h=300&fit=crop"],
    contact_phone: "+17057483333",
    contact_email: "sports.memorabilia@email.com"
  },
  {
    title: "Complete Office Setup - Remote Work",
    description: "Complete home office setup: Standing desk, ergonomic chair, dual monitor mounts, 24\" monitors, docking station, keyboard, mouse, and headset. All equipment excellent condition, perfect for remote work. Cable management included. Worth over $2500 new.",
    price: 1200,
    category: "Office Furniture",
    location: "Lindsay, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"],
    contact_phone: "+17053246666",
    contact_email: "home.office@email.com"
  },
  {
    title: "Musical Instruments - Student Package",
    description: "Student musical instrument package: Yamaha keyboard, acoustic guitar, violin, and music stand. All instruments good condition, perfect for beginners or music students. Includes books and accessories. Great way to try different instruments before committing to one.",
    price: 300,
    category: "Music",
    location: "Fenelon Falls, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop"],
    contact_phone: "+17058889999",
    contact_email: "student.instruments@email.com"
  },
  {
    title: "Complete Kitchen Setup - Gourmet Cooking",
    description: "Gourmet cooking setup: KitchenAid mixer, food processor, blender, set of stainless steel cookware, knife set, and small appliances. All items excellent condition, perfect for serious home cooks. High-end brands, worth over $3000 new. Selling because moving to furnished home.",
    price: 1500,
    category: "Kitchen",
    location: "Haliburton, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=300&fit=crop"],
    contact_phone: "+17057775555",
    contact_email: "gourmet.kitchen@email.com"
  },
  {
    title: "Camping Trailer - Small & Lightweight",
    description: "2016 Jayco Hummingbird travel trailer, 16ft. Lightweight, easy to tow with SUV. Sleeps 4, kitchenette, bathroom, AC/heat. Excellent condition, well-maintained. Perfect for weekend getaways. All systems work perfectly. Selling because upgrading to larger RV.",
    price: 12000,
    category: "RVs & Campers",
    location: "Minden, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop"],
    contact_phone: "+17058884444",
    contact_email: "travel.trailer@email.com"
  },
  {
    title: "Complete Photography Studio Setup",
    description: "Professional photography studio: Backdrops, lighting equipment, props, and editing computer. Perfect for portrait or product photography. All equipment excellent condition, includes various backdrop colors and professional lighting. Great for photographers starting their own business.",
    price: 2500,
    category: "Photography",
    location: "Huntsville, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1543857778-c4a1a569e7bd?w=400&h=300&fit=crop"],
    contact_phone: "+17056663333",
    contact_email: "photo.studio@email.com"
  },
  {
    title: "Vintage Record Player Collection",
    description: "Collection of vintage record players: 1950s-1970s era, various brands including RCA, Zenith, and Magnavox. All restored to working condition, beautiful retro styling. Perfect for vinyl enthusiasts or vintage decor. Some units include original cabinets and speakers.",
    price: 800,
    category: "Music",
    location: "Gravenhurst, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1565372195514-5d3b9e7d8a1d?w=400&h=300&fit=crop"],
    contact_phone: "+17057772222",
    contact_email: "vintage.records@email.com"
  },
  {
    title: "Complete Fitness Package - Home Gym",
    description: "Complete home fitness setup: Treadmill, elliptical, weight bench with barbell set, dumbbells, and yoga area. All equipment excellent condition, regularly maintained. Perfect for full-body workouts at home. Save on gym membership fees. Worth over $4000 new.",
    price: 2000,
    category: "Sports & Fitness",
    location: "Bracebridge, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"],
    contact_phone: "+17058881111",
    contact_email: "fitness.package@email.com"
  },
  {
    title: "Antique Furniture Collection",
    description: "Collection of antique furniture pieces: Victorian dresser, Edwardian dining set, and Art Deco sideboard. All pieces authentic, restored to excellent condition. Perfect for historic homes or antique enthusiasts. Each piece has documented provenance and appraisal.",
    price: 3500,
    category: "Antiques",
    location: "Parry Sound, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"],
    contact_phone: "+17057776666",
    contact_email: "antique.furniture@email.com"
  },
  {
    title: "Professional Baking Equipment",
    description: "Complete baking setup: Commercial oven, mixer, baking pans, decorating tools, and ingredient storage. Perfect for home baking business or serious enthusiasts. All equipment excellent condition, regularly cleaned and maintained. Includes recipes and business plan.",
    price: 3000,
    category: "Kitchen",
    location: "Blind River, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop"],
    contact_phone: "+17056665555",
    contact_email: "baking.equipment@email.com"
  },
  {
    title: "Complete Woodworking Shop",
    description: "Complete woodworking shop: Table saw, planer, jointer, router table, and various hand tools. Perfect for furniture making or serious hobbyists. All equipment excellent condition, well-maintained. Includes lumber storage and workshop organization system.",
    price: 5000,
    category: "Tools",
    location: "Sault Ste. Marie, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1581091226825-a6a3a5b81455?w=400&h=300&fit=crop"],
    contact_phone: "+17058883333",
    contact_email: "woodworking.shop@email.com"
  },
  {
    title: "Vintage Car Parts Collection",
    description: "Collection of vintage car parts: 1950s-1970s era Ford and GM parts. Includes engines, transmissions, body panels, and accessories. All parts authentic, many NOS (New Old Stock). Perfect for car restoration projects. Includes rare and hard-to-find items.",
    price: 4000,
    category: "Auto Parts",
    location: "Thunder Bay, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1544216041-30248a6388c1?w=400&h=300&fit=crop"],
    contact_phone: "+18076664444",
    contact_email: "vintage.parts@email.com"
  },
  {
    title: "Complete Home Theater System",
    description: "High-end home theater setup: 75\" 4K TV, surround sound system, streaming devices, gaming console, and comfortable seating. Perfect for movie nights or gaming. All equipment excellent condition, professionally installed. Includes all cables and accessories.",
    price: 3500,
    category: "Electronics",
    location: "Kenora, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1593784997457-395e0e4b5c5e?w=400&h=300&fit=crop"],
    contact_phone: "+18076665555",
    contact_email: "home.theater@email.com"
  },
  {
    title: "Hunting & Fishing Equipment",
    description: "Complete hunting and fishing setup: Rifle, shotgun, bows, tree stands, fishing rods, reels, and all accessories. All equipment excellent condition, well-maintained. Perfect for outdoor enthusiasts. Includes safety equipment and storage cases.",
    price: 2500,
    category: "Outdoor Recreation",
    location: "Dryden, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=300&fit=crop"],
    contact_phone: "+18077776666",
    contact_email: "hunting.fishing@email.com"
  },
  {
    title: "Professional Beauty Salon Equipment",
    description: "Complete beauty salon setup: Styling chairs, shampoo station, hair dryers, manicure table, and reception desk. All equipment excellent condition, recently updated. Perfect for starting or expanding a salon business. Includes inventory and supplies.",
    price: 4000,
    category: "Business Equipment",
    location: "Fort Frances, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop"],
    contact_phone: "+18078887777",
    contact_email: "salon.equipment@email.com"
  },
  {
    title: "Vintage Comic Book Collection",
    description: "Collection of vintage comic books: Marvel and DC from 1960s-1980s. Includes first appearances and key issues. All books graded and bagged. Perfect for collectors or investors. Includes Spider-Man, Batman, Superman, and X-Men titles. Rare finds throughout.",
    price: 5000,
    category: "Collectibles",
    location: "Atikokan, Ontario",
    condition_type: "good",
    images: ["https://images.unsplash.com/photo-1622021384118-4e2c4e4a4a5d?w=400&h=300&fit=crop"],
    contact_phone: "+18076668888",
    contact_email: "comic.books@email.com"
  },
  {
    title: "Complete Farm Equipment Package",
    description: "Small farm equipment setup: Tractor with attachments, plow, harrow, and various tools. Perfect for small hobby farm or large garden. All equipment excellent condition, well-maintained. Includes manuals and extra parts. Great for sustainable living.",
    price: 8000,
    category: "Farm Equipment",
    location: "Sioux Lookout, Ontario",
    condition_type: "excellent",
    images: ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop"],
    contact_phone: "+18077779999",
    contact_email: "farm.equipment@email.com"
  }
];

// Helper function to create random users
async function createRandomUsers(count) {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Amanda', 'Robert', 'Lisa', 'Michael', 'Jennifer', 'William', 'Jessica', 'Richard', 'Ashley'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'email.com'];
  const locations = ['Toronto, Ontario', 'Vancouver, British Columbia', 'Montreal, Quebec', 'Calgary, Alberta', 'Ottawa, Ontario', 'Edmonton, Alberta', 'Winnipeg, Manitoba', 'Quebec City, Quebec'];

  const users = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    const email = `${username}@${domains[Math.floor(Math.random() * domains.length)]}`;
    const phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    const location = locations[Math.floor(Math.random() * locations.length)];

    try {
      // Hash password
      const password_hash = await bcrypt.hash('password123', 10);

      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, full_name, phone, location, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         RETURNING *`,
        [username, email, password_hash, `${firstName} ${lastName}`, phone, location]
      );

      users.push(result.rows[0]);
    } catch (error) {
      console.log(`Error creating user ${username}:`, error.message);
    }
  }

  return users;
}

// Main function to populate ads
async function populateAds() {
  try {
    console.log('Starting database population...');

    // Create some random users first
    console.log('Creating users...');
    const users = await createRandomUsers(20);
    console.log(`Created ${users.length} users`);

    // Create ads
    console.log('Creating advertisements...');
    let createdCount = 0;

    for (const adData of sampleAds) {
      try {
        // Pick a random user for this ad
        const randomUser = users[Math.floor(Math.random() * users.length)];

        // Create the ad
        const ad = await Advertisement.create({
          user_id: randomUser.id,
          title: adData.title,
          description: adData.description,
          price: adData.price,
          category: adData.category,
          location: adData.location,
          images: adData.images || [],
          condition_type: adData.condition_type,
          contact_phone: adData.contact_phone,
          contact_email: adData.contact_email
        });

        createdCount++;
        console.log(`Created ad ${createdCount}: ${ad.title}`);

        // Add a small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.log(`Error creating ad "${adData.title}":`, error.message);
      }
    }

    console.log(`\nPopulation complete! Created ${createdCount} advertisements.`);

    // Get final counts
    const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
    const adCountResult = await pool.query('SELECT COUNT(*) FROM advertisements WHERE is_active = true');

    console.log(`Total users in database: ${userCountResult.rows[0].count}`);
    console.log(`Total ads in database: ${adCountResult.rows[0].count}`);

  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    // Note: You might want to add pool.end() if using a connection pool
    console.log('Database population script completed.');
  }
}

// Run the population
populateAds();