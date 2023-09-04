// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
app.use(bodyParser.json());


const url = `mongodb+srv://Ankur123:${process.env.password}@ankur0.221bw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database has been connected!"))
  .catch((err) => {
    console.log(err)
  });


// Customer Schema and Model
const customerSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  city: String,
  company: String,
});
const Customer = mongoose.model('Customer', customerSchema);

// API to create a customer
app.post('/customers', async (req, res) => {
  try {
    const { first_name, last_name, city, company } = req.body;

    // Validate fields
    if (!first_name || !last_name || !city || !company) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Checking if the city and company already exist (Assuming cities and companies are predefined)
    // You can have a separate City and Company model and validate here
    const existingCustomer = await Customer.findOne({ city, company });

    if (!existingCustomer) {
      return res.status(400).json({ message: 'City and company do not exist for an existing customer.' });
    }

    const newCustomer = new Customer({ first_name, last_name, city, company });
    await newCustomer.save();

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to list customers with search, pagination
app.get('/customers', async (req, res) => {
  try {
    const { page = 1, limit = 10, first_name, last_name, city } = req.query;
    const filter = {};

    if (first_name) filter.first_name = first_name;
    if (last_name) filter.last_name = last_name;
    if (city) filter.city = city;

    const customers = await Customer.find(filter)
      .skip((page - 1) * limit)
      .limit(+limit);

    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to get a single customer by id
app.get('/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to list all unique cities with the number of customers
app.get('/unique-cities', async (req, res) => {
  try {
    const cities = await Customer.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
