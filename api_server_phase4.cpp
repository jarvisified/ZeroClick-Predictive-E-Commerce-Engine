#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <map>
#include <queue>
#include <algorithm>
#include "httplib.h"
#include "json.hpp"

using namespace std;
using json = nlohmann::json;

int main()
{
    // 1. Load the 10,000 user database into RAM
    ifstream file("data.json");
    json db;
    if (file.is_open())
    {
        file >> db;
        file.close();
        cout << "[SYSTEM] Loaded " << db.size() << " users into memory." << endl;
    }
    else
    {
        cout << "[ERROR] Could not open data.json" << endl;
        return 1;
    }

    httplib::Server svr;

    // Handle CORS Preflight requests for the React frontend
    svr.Options(".*", [](const httplib::Request &, httplib::Response &res)
                {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.set_content("", "text/plain"); });

    // GET /api/forecast -> Calculate WMA for a given user
    svr.Get("/api/forecast", [&db](const httplib::Request &req, httplib::Response &res)
            {
        res.set_header("Access-Control-Allow-Origin", "*");
        string uid = req.has_param("uid") ? req.get_param_value("uid") : "U1";

        if (!db.contains(uid)) {
            res.status = 404;
            res.set_content("{\"error\":\"User not found\"}", "application/json");
            return;
        }

        auto history = db[uid]["history"];
        map<string, vector<int>> itemDays;
        
        // Group purchase days by item
        for (auto& purchase : history) {
            itemDays[purchase["name"].get<string>()].push_back(purchase["day"].get<int>());
        }

        // Max-Heap to sort items by urgency (O(log N) insertion)
        priority_queue<pair<int, string>> maxHeap;

        for (auto& pair : itemDays) {
            string itemName = pair.first;
            vector<int> days = pair.second;
            sort(days.begin(), days.end());

            if (days.size() < 2) continue; // Need at least 2 data points for WMA

            vector<int> intervals;
            for (size_t i = 1; i < days.size(); i++) {
                intervals.push_back(days[i] - days[i-1]);
            }

            int n = intervals.size();
            double wma = 0.0;
            int weightSum = 0;
            
            // WMA Formula
            for (int i = 0; i < n; i++) {
                int weight = i + 1;
                wma += intervals[i] * weight;
                weightSum += weight;
            }
            wma /= weightSum;

            int lastDay = days.back();
            int projectedRunoutDay = lastDay + (int)wma;
            int urgencyScore = 180 - projectedRunoutDay; 

            // ALGORITHM FIX: If the user just bought it in the last 2 days, 
            // force the urgency to be deeply negative so it hides from the UI
            if (180 - lastDay <= 2) {
                urgencyScore = -999; 
            }

            // Only recommend if the urgency is high (Running out in 3 days or already out)
            if (urgencyScore > -3) {
                maxHeap.push({urgencyScore, itemName});
            }
        }

        json forecast = json::array();
        int count = 0;
        // Extract top 3 most urgent items
        while (!maxHeap.empty() && count < 3) { 
            forecast.push_back(maxHeap.top().second);
            maxHeap.pop();
            count++;
        }

        json response;
        response["data"] = {
            {"forecast", forecast},
            {"history", history}
        };

        res.set_content(response.dump(), "application/json"); });

    // POST /api/buy -> Simulate a purchase and update RAM
    svr.Post("/api/buy", [&db](const httplib::Request &req, httplib::Response &res)
             {
        res.set_header("Access-Control-Allow-Origin", "*");
        try {
            auto body = json::parse(req.body);
            string uid = body["uid"];
            string item = body["item"];
            int day = body["day"];
            
            // Add to RAM memory ONLY! (We removed the code that writes to data.json)
            // This ensures your testing never corrupts the base mock data.
            db[uid]["history"].push_back({
                {"name", item},
                {"day", day}
            });
            
            res.set_content("{\"status\":\"success\"}", "application/json");
        } catch(const exception& e) {
            res.status = 400;
            res.set_content("{\"error\":\"Invalid JSON\"}", "application/json");
        } });

    cout << "[SYSTEM] API Server running dynamically on http://localhost:8080" << endl;
    svr.listen("0.0.0.0", 8080);
    return 0;
}