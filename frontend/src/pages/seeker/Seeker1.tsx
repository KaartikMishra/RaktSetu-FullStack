import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input"; 
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";  // ✅ Search bar ke liye import

import BloodRequestForm from './BloodRequestForm';
import { useState, useEffect } from 'react';

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Default marker fix
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function BloodDashboard() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");   // ✅ search bar ka state

  useEffect(() => {
    setShowRequestForm(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const bloodRequests: { city: string; coords: [number, number] }[] = [
    { city: "Delhi", coords: [28.6139, 77.2090] },
    { city: "Mumbai", coords: [19.0760, 72.8777] },
    { city: "Kolkata", coords: [22.5726, 88.3639] },
  ];

  // ✅ Filtered requests
  const filteredRequests = bloodRequests.filter(req =>
    req.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 grid grid-cols-4 gap-6 font-sans">
      
      {/* Header */}
      <header className="col-span-4 flex justify-between items-center border-b border-gray-200 pb-3">
        <h1 className="text-xl font-bold tracking-wide text-red-600">
          Blood Map Dashboard
        </h1>
        <div className="flex items-center gap-4">
          {/* ✅ Search Bar */}
          <Input
            type="text"
            placeholder="Search city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 border-gray-300 focus:ring-red-500 focus:border-red-500"
          />
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white font-medium"
            onClick={() => setShowRequestForm(true)}
          >
            Request Blood
          </Button>
          <p className="text-sm text-gray-500">
            {dateTime.toLocaleTimeString()} • {dateTime.toLocaleDateString()}
          </p>
        </div>
      </header>

      {/* Blood Request Form Dialog */}
      <BloodRequestForm
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
      />

      {/* Target Profile */}
      <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition">
        <CardHeader className="flex items-center gap-3">
          <Avatar className="w-16 h-16 ring-2 ring-red-500">
            <AvatarImage src="https://via.placeholder.com/64" />
            <AvatarFallback>TG</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-semibold text-gray-700">
              Target Profile
            </CardTitle>
            <p className="text-xs text-gray-500">Patient ID: #12345</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2 text-gray-700">
            <p>Elangan: <span className="font-semibold text-gray-900">6.50</span></p>
            <p>Level: <span className="font-semibold text-gray-900">23.20</span></p>
            <p>Units: <span className="font-semibold text-gray-900">56.25</span></p>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-gray-500">Blood Type Match</p>
            <Progress value={60} className="mt-1" />
            <p className="text-xs text-red-600 mt-1 font-medium">60% Match</p>
          </div>
        </CardContent>
      </Card>

      {/* Blood Map */}
      <Card className="col-span-2 bg-white border border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700">Blood Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300">
            <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {filteredRequests.map((req, i) => (
                <Marker key={i} position={req.coords}>
                  <Popup className="text-sm font-medium text-gray-700">
                    {req.city} - Blood Request
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Resource Management */}
      <Card className="bg-white border border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700">Resource Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-gray-600">Current: <span className="font-medium text-gray-900">556</span></p>
          <p className="text-gray-600">Dandas: <span className="font-medium text-gray-900">35,12.50</span></p>
          <Separator />
          <p className="text-gray-600">Blood Reserves</p>
          <Progress value={20} className="bg-gray-100" />
          <Progress value={50} className="bg-gray-100" />
          <Progress value={80} className="bg-gray-100" />
        </CardContent>
      </Card>

      {/* Detection Log */}
      <Card className="bg-white border border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700">Detection Log</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1 text-gray-600">
          {["Poom Pwoim", "Percemt", "M99.AND", "Gratts", "Chandour"].map(
            (item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item}</span>
                <span className="font-medium text-gray-900">{Math.floor(Math.random() * 900)}</span>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Tool Inventory */}
      <Card className="bg-white border border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700">Tool Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {["Snajor", "Sand", "Sensor", "Sengor"].map((tool, i) => (
              <Button key={i} className="bg-red-600 hover:bg-red-700 text-white text-xs">
                {tool}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mission Tracker */}
      <Card className="bg-white border border-gray-200 shadow-md col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700">Mission Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px] bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
            Graph Placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
