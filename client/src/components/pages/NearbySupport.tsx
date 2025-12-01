import {useState, useEffect, useMemo} from "react";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Badge} from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type {SupportService} from "@/types";

const NearbySupport = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState<SupportService[]>(
    []
  );

  // Mock data for support services - memoized to prevent re-creation on every render
  const supportServices = useMemo<SupportService[]>(
    () => [
      {
        id: "1",
        name: "Emergency Services (911)",
        type: "emergency",
        phone: "911",
        address: "Nationwide Emergency Response",
        description:
          "Immediate emergency response for life-threatening situations",
        hours: "24/7",
        distance: "0 miles",
        isOpen: true,
      },
      {
        id: "2",
        name: "Crisis Text Line",
        type: "mental-health",
        phone: "741741",
        address: "Text-based Crisis Support",
        description: "Free, 24/7 crisis support via text message",
        hours: "24/7",
        distance: "Available everywhere",
        isOpen: true,
      },
      {
        id: "3",
        name: "National Suicide Prevention Lifeline",
        type: "mental-health",
        phone: "988",
        address: "National Crisis Support",
        description:
          "Free and confidential emotional support for people in suicidal crisis",
        hours: "24/7",
        distance: "Available everywhere",
        isOpen: true,
        website: "https://suicidepreventionlifeline.org",
      },
      {
        id: "4",
        name: "Local Police Department",
        type: "emergency",
        phone: "(555) 123-4567",
        address: "123 Main Street, Your City",
        description: "Non-emergency police services and community safety",
        hours: "24/7",
        distance: "2.3 miles",
        isOpen: true,
      },
      {
        id: "5",
        name: "City General Hospital",
        type: "medical",
        phone: "(555) 234-5678",
        address: "456 Health Ave, Your City",
        description: "Full-service hospital with emergency room",
        hours: "24/7",
        distance: "1.8 miles",
        isOpen: true,
        website: "https://citygeneralhospital.com",
      },
      {
        id: "6",
        name: "Community Mental Health Center",
        type: "mental-health",
        phone: "(555) 345-6789",
        address: "789 Wellness Blvd, Your City",
        description: "Counseling, therapy, and mental health support services",
        hours: "Mon-Fri 8AM-6PM",
        distance: "3.1 miles",
        isOpen: true,
      },
      {
        id: "7",
        name: "Domestic Violence Shelter",
        type: "shelter",
        phone: "(555) 456-7890",
        address: "Confidential Location",
        description: "Safe housing and support for domestic violence survivors",
        hours: "24/7 Hotline",
        distance: "Contact for location",
        isOpen: true,
      },
      {
        id: "8",
        name: "Legal Aid Society",
        type: "legal",
        phone: "(555) 567-8901",
        address: "321 Justice St, Your City",
        description: "Free legal assistance for low-income individuals",
        hours: "Mon-Fri 9AM-5PM",
        distance: "4.2 miles",
        isOpen: false,
      },
      {
        id: "9",
        name: "Community Food Bank",
        type: "community",
        phone: "(555) 678-9012",
        address: "654 Hope Lane, Your City",
        description: "Food assistance and community support programs",
        hours: "Tue, Thu, Sat 10AM-2PM",
        distance: "2.7 miles",
        isOpen: false,
      },
      {
        id: "10",
        name: "Homeless Services Center",
        type: "shelter",
        phone: "(555) 789-0123",
        address: "987 Care Circle, Your City",
        description: "Housing assistance, meals, and support services",
        hours: "Mon-Sun 7AM-7PM",
        distance: "3.5 miles",
        isOpen: true,
      },
    ],
    []
  );

  // Filter services based on category and search term
  useEffect(() => {
    let filtered = supportServices;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (service) => service.type === selectedCategory
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [selectedCategory, searchTerm, supportServices]);

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200";
      case "medical":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "mental-health":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "community":
        return "bg-green-100 text-green-800 border-green-200";
      case "legal":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shelter":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 mt-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nearby Support Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find emergency services, support organizations, and community
            resources in your area
          </p>
        </div>

        {/* Emergency Quick Actions */}
        <div className="mb-8 rounded-xl p-6 border border-red-400">
          <h2 className="text-2xl font-bold text-red-900 mb-4">
            Emergency Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="tel:911"
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="font-bold">Call 911</div>
              <div className="text-sm opacity-90">Emergency Services</div>
            </a>
            <a
              href="tel:988"
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="font-bold">Call 988</div>
              <div className="text-sm opacity-90">Crisis Lifeline</div>
            </a>
            <a
              href="sms:741741?body=HOME"
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="font-bold">Text 741741</div>
              <div className="text-sm opacity-90">Crisis Text Line</div>
            </a>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Services
              </label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
              >
                <SelectTrigger className="border border-gray-300 rounded-md p-2 w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="border border-red-200 shadow-sm bg-white">
                  <SelectItem value="all">All Services </SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="shelter">Shelter</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.name}
                  </h3>
                  <Badge className={getServiceTypeColor(service.type)}>
                    {service.type.replace("-", " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {service.isOpen ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Open
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                      Closed
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-4">{service.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {service.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {service.address}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {service.hours}
                </div>
                {service.distance && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    {service.distance}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-center transition-colors">
                  <a
                    href={`tel:${service.phone}`}
                    className="flex-1  text-white px-4 py-2 rounded-md text-center transition-colors"
                  >
                    Call Now
                  </a>
                </Button>

                {service.website && (
                  <Button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-center transition-colors">
                    <a
                      href={service.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Website
                    </a>
                  </Button>
                )}
                <Button
                  onClick={() =>
                    window.open(
                      `https://maps.google.com/?q=${encodeURIComponent(
                        service.address
                      )}`,
                      "_blank"
                    )
                  }
                  variant="outline"
                  className="px-4 py-2"
                >
                  Directions
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbySupport;
