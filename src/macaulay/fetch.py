import subprocess
import json

def download_and_merge_taxonomy():
    # Define the API token and URLs
    api_token = "7lqpp8tk53jh"
    fr_url = "https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale=fr_CA"
    en_url = "https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale=en_CA"
    
    # Run curl for French taxonomy
    curl_fr = f"curl -H \"X-eBirdApiToken: {api_token}\" \"{fr_url}\""
    fr_data = subprocess.check_output(curl_fr, shell=True)
    
    # Run curl for English taxonomy
    curl_en = f"curl -H \"X-eBirdApiToken: {api_token}\" \"{en_url}\""
    en_data = subprocess.check_output(curl_en, shell=True)
    
    # Decode JSON data from the curl output
    fr_data = json.loads(fr_data)
    en_data = json.loads(en_data)

    # Build a lookup for French comName by speciesCode
    fr_name_by_code = {entry["speciesCode"]: entry["comName"] for entry in fr_data}

    # Create a new list with only the desired fields
    merged_data = []
    for entry in en_data:
        species_code = entry.get("speciesCode")
        if species_code in fr_name_by_code and not species_code[-1].isdigit():
            merged_entry = {
                "sciName": entry["sciName"],
                "comName": entry["comName"],
                "comNameFr": fr_name_by_code[species_code],
                "speciesCode": species_code,
            }
            merged_data.append(merged_entry)

    # Save the merged data to a file
    with open("ebird_taxonomy_merged_minimal.json", "w", encoding="utf-8") as f_out:
        json.dump(merged_data, f_out, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    download_and_merge_taxonomy()
