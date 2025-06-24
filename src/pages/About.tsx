
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Home, Users, Shield, Clock, HeartHandshake } from 'lucide-react';

export default function About() {
  const teamMembers = [
    {
      name: "Priya Sharma",
      position: "Founder & CEO",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Rahul Mehra",
      position: "Chief Technology Officer",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Ananya Patel",
      position: "Head of Operations",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-homefinder-primary to-homefinder-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About Home Finder
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Transforming the way people buy, sell, and rent properties in India with transparency and zero brokerage.
          </p>
        </div>
      </section>
      
      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Home Finder was founded in 2020 with a mission to solve the biggest challenges in the Indian real estate market - lack of transparency, high broker fees, and difficulty in finding authentic property information.
              </p>
              <p className="text-muted-foreground mb-4">
                Our founders, who faced these challenges firsthand, decided to create a platform that connects buyers, sellers, and tenants directly, eliminating the need for intermediaries and making property transactions smoother and more affordable.
              </p>
              <p className="text-muted-foreground">
                Today, Home Finder has helped thousands of people across major Indian cities find their perfect homes without paying hefty brokerage fees, and we continue to innovate to make real estate transactions even more seamless.
              </p>
            </div>
            <div className="relative h-80 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80" 
                alt="Home Finder Office"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Mission and Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
            To create a transparent, accessible, and affordable real estate ecosystem that empowers every Indian to find their dream home without hassles.
          </p>
          
          <h3 className="text-2xl font-bold mb-8">Our Core Values</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-homefinder-light flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-homefinder-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Transparency</h4>
                <p className="text-muted-foreground">
                  We believe in complete transparency in all property transactions and information.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-homefinder-light flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-homefinder-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Customer First</h4>
                <p className="text-muted-foreground">
                  We put our customers' needs and satisfaction at the center of everything we do.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-homefinder-light flex items-center justify-center mb-4">
                  <HeartHandshake className="h-8 w-8 text-homefinder-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Trust & Reliability</h4>
                <p className="text-muted-foreground">
                  We build relationships based on trust and deliver reliable property information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Key Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">How We Help You</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="h-12 w-12 rounded-full bg-homefinder-light flex items-center justify-center mr-4 mt-1">
                <Building className="h-6 w-6 text-homefinder-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Zero Brokerage</h3>
                <p className="text-muted-foreground">
                  Connect directly with owners and save lakhs in brokerage fees. Our platform enables transparent dealings without intermediaries.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-12 w-12 rounded-full bg-homefinder-light flex items-center justify-center mr-4 mt-1">
                <Shield className="h-6 w-6 text-homefinder-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
                <p className="text-muted-foreground">
                  Every property on Home Finder goes through a verification process to ensure authenticity and accurate information.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-12 w-12 rounded-full bg-homefinder-light flex items-center justify-center mr-4 mt-1">
                <Home className="h-6 w-6 text-homefinder-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
                <p className="text-muted-foreground">
                  Browse thousands of properties across all major Indian cities, with new listings added daily to give you more options.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-12 w-12 rounded-full bg-homefinder-light flex items-center justify-center mr-4 mt-1">
                <Clock className="h-6 w-6 text-homefinder-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Quick Transactions</h3>
                <p className="text-muted-foreground">
                  Our streamlined process helps you close deals faster, whether you're buying, selling, or renting a property.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-10">Meet Our Leadership Team</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {teamMembers.map(member => (
              <div key={member.name} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-muted-foreground">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Contact CTA */}
      <section className="py-16 bg-homefinder-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Have questions about Home Finder? Our team is here to help you with any queries related to buying, selling, or renting properties.
          </p>
          <Button size="lg" className="bg-homefinder-primary hover:bg-homefinder-accent">
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
}
