#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <random>
#include "json.hpp" // Ensure you have downloaded json.hpp from nlohmann/json

using namespace std;
using json = nlohmann::json;

class DataGen
{
private:
    int numUsers;
    vector<string> types;
    vector<string> items;

    random_device rd;
    mt19937 gen;

    int getRand(int min, int max)
    {
        uniform_int_distribution<> dist(min, max);
        return dist(gen);
    }

public:
    DataGen(int n)
    {
        numUsers = n;
        gen = mt19937(rd());
        types = {"Single", "Family"};
        items = {"Coffee", "Paste", "Milk", "Soap"};
    }

    void build(string file)
    {
        json db;
        cout << "Making data for " << numUsers << " users...\n";

        for (int i = 1; i <= numUsers; i++)
        {
            string uid = "U" + to_string(i);
            string type = types[getRand(0, types.size() - 1)];

            json history = json::array();
            int buys = getRand(15, 60);

            // Add random purchases to user history
            for (int j = 0; j < buys; j++)
            {
                json item;
                item["name"] = items[getRand(0, items.size() - 1)];
                item["day"] = getRand(1, 180);
                history.push_back(item);
            }

            json user;
            user["type"] = type;
            user["history"] = history;

            db[uid] = user;
        }

        ofstream out(file);
        if (out.is_open())
        {
            out << db.dump(4);
            out.close();
            cout << "Done! Saved to " << file << "\n";
        }
        else
        {
            cout << "Error writing file.\n";
        }
    }
};

int main()
{
    DataGen gen(10000);
    gen.build("data.json");
    return 0;
}
