#!/usr/bin/env python3
"""
Backend API test suite for ScrapValue
Tests all API endpoints with proper validation
"""
import requests
import json
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/.env')

BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://green-scan-ai-1.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Small 1x1 transparent PNG for testing
TEST_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="

VALID_CATEGORIES = ['plastic', 'metal', 'glass', 'paper', 'textile']

def test_api_root():
    """Test GET /api endpoint"""
    print("\n" + "="*60)
    print("TEST 1: GET /api (root endpoint)")
    print("="*60)
    
    try:
        response = requests.get(f"{API_BASE}", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate response shape
        if 'message' not in data:
            print("❌ FAILED: Missing 'message' field")
            return False
        
        if 'endpoints' not in data:
            print("❌ FAILED: Missing 'endpoints' field")
            return False
        
        if not isinstance(data['endpoints'], list):
            print("❌ FAILED: 'endpoints' should be an array")
            return False
        
        print("✅ PASSED: Root endpoint returns correct JSON shape")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def test_market_endpoint():
    """Test GET /api/market endpoint"""
    print("\n" + "="*60)
    print("TEST 2: GET /api/market")
    print("="*60)
    
    try:
        response = requests.get(f"{API_BASE}/market", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate response shape
        required_fields = ['prices', 'updatedAt', 'currency', 'trends']
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing '{field}' field")
                return False
        
        # Validate prices object
        if not isinstance(data['prices'], dict):
            print("❌ FAILED: 'prices' should be an object")
            return False
        
        required_materials = ['plastic', 'textile', 'metal', 'glass', 'paper']
        for material in required_materials:
            if material not in data['prices']:
                print(f"❌ FAILED: Missing '{material}' in prices")
                return False
            if not isinstance(data['prices'][material], (int, float)):
                print(f"❌ FAILED: Price for '{material}' should be a number")
                return False
        
        # Validate currency
        if data['currency'] != 'SGD':
            print(f"❌ FAILED: Expected currency 'SGD', got '{data['currency']}'")
            return False
        
        # Validate trends object
        if not isinstance(data['trends'], dict):
            print("❌ FAILED: 'trends' should be an object")
            return False
        
        for material in required_materials:
            if material not in data['trends']:
                print(f"❌ FAILED: Missing '{material}' in trends")
                return False
            if not isinstance(data['trends'][material], (int, float)):
                print(f"❌ FAILED: Trend for '{material}' should be a number")
                return False
        
        # Validate updatedAt is ISO date string
        if not isinstance(data['updatedAt'], str):
            print("❌ FAILED: 'updatedAt' should be a string")
            return False
        
        print("✅ PASSED: Market endpoint returns correct JSON shape")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def test_stats_endpoint_empty():
    """Test GET /api/stats endpoint (may be empty initially)"""
    print("\n" + "="*60)
    print("TEST 3: GET /api/stats (initial state)")
    print("="*60)
    
    try:
        response = requests.get(f"{API_BASE}/stats", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate response shape
        required_fields = ['totalScans', 'totalEarnings', 'totalWeight', 'totalCO2', 'byCategory', 'recent']
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing '{field}' field")
                return False
        
        # Validate types
        if not isinstance(data['totalScans'], int):
            print("❌ FAILED: 'totalScans' should be an integer")
            return False
        
        if not isinstance(data['totalEarnings'], (int, float)):
            print("❌ FAILED: 'totalEarnings' should be a number")
            return False
        
        if not isinstance(data['totalWeight'], (int, float)):
            print("❌ FAILED: 'totalWeight' should be a number")
            return False
        
        if not isinstance(data['totalCO2'], (int, float)):
            print("❌ FAILED: 'totalCO2' should be a number")
            return False
        
        if not isinstance(data['byCategory'], dict):
            print("❌ FAILED: 'byCategory' should be an object")
            return False
        
        if not isinstance(data['recent'], list):
            print("❌ FAILED: 'recent' should be an array")
            return False
        
        print(f"✅ PASSED: Stats endpoint returns correct JSON shape (totalScans: {data['totalScans']})")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def test_scan_missing_image():
    """Test POST /api/scan with missing imageBase64"""
    print("\n" + "="*60)
    print("TEST 4: POST /api/scan (missing imageBase64)")
    print("="*60)
    
    try:
        response = requests.post(f"{API_BASE}/scan", json={}, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code not in [400, 422]:
            print(f"❌ FAILED: Expected 4xx error, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if 'error' not in data:
            print("❌ FAILED: Expected 'error' field in response")
            return False
        
        print("✅ PASSED: Correctly returns 4xx error for missing imageBase64")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def test_scan_with_prefix():
    """Test POST /api/scan with data URL prefix"""
    print("\n" + "="*60)
    print("TEST 5: POST /api/scan (with data URL prefix)")
    print("="*60)
    
    try:
        payload = {
            "imageBase64": f"data:image/png;base64,{TEST_IMAGE_BASE64}"
        }
        
        print("Sending request (may take up to 30s for LLM call)...")
        response = requests.post(f"{API_BASE}/scan", json=payload, timeout=35)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate response shape
        required_fields = ['category', 'confidenceScore', 'estimatedWeightKg', 'description', 'estimatedValue', 'co2Saved', 'marketPrice']
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing '{field}' field")
                return False
        
        # Validate category
        if data['category'] not in VALID_CATEGORIES:
            print(f"❌ FAILED: Invalid category '{data['category']}'. Must be one of {VALID_CATEGORIES}")
            return False
        
        # Validate confidenceScore (0-1)
        if not (0 <= data['confidenceScore'] <= 1):
            print(f"❌ FAILED: confidenceScore {data['confidenceScore']} should be between 0 and 1")
            return False
        
        # Validate estimatedWeightKg is a number
        if not isinstance(data['estimatedWeightKg'], (int, float)):
            print("❌ FAILED: estimatedWeightKg should be a number")
            return False
        
        # Validate description is a string
        if not isinstance(data['description'], str):
            print("❌ FAILED: description should be a string")
            return False
        
        # Validate estimatedValue is a number
        if not isinstance(data['estimatedValue'], (int, float)):
            print("❌ FAILED: estimatedValue should be a number")
            return False
        
        # Validate co2Saved is a number
        if not isinstance(data['co2Saved'], (int, float)):
            print("❌ FAILED: co2Saved should be a number")
            return False
        
        # Validate marketPrice is a number
        if not isinstance(data['marketPrice'], (int, float)):
            print("❌ FAILED: marketPrice should be a number")
            return False
        
        # Validate estimatedValue ≈ estimatedWeightKg * marketPrice
        expected_value = data['estimatedWeightKg'] * data['marketPrice']
        if abs(data['estimatedValue'] - expected_value) > 0.01:
            print(f"❌ FAILED: estimatedValue {data['estimatedValue']} doesn't match estimatedWeightKg * marketPrice = {expected_value}")
            return False
        
        print("✅ PASSED: Scan with data URL prefix returns valid response")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def test_scan_without_prefix():
    """Test POST /api/scan without data URL prefix"""
    print("\n" + "="*60)
    print("TEST 6: POST /api/scan (without data URL prefix)")
    print("="*60)
    
    try:
        payload = {
            "imageBase64": TEST_IMAGE_BASE64
        }
        
        print("Sending request (may take up to 30s for LLM call)...")
        response = requests.post(f"{API_BASE}/scan", json=payload, timeout=35)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate response shape (same as test 5)
        required_fields = ['category', 'confidenceScore', 'estimatedWeightKg', 'description', 'estimatedValue', 'co2Saved', 'marketPrice']
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing '{field}' field")
                return False
        
        # Validate category
        if data['category'] not in VALID_CATEGORIES:
            print(f"❌ FAILED: Invalid category '{data['category']}'. Must be one of {VALID_CATEGORIES}")
            return False
        
        # Validate confidenceScore (0-1)
        if not (0 <= data['confidenceScore'] <= 1):
            print(f"❌ FAILED: confidenceScore {data['confidenceScore']} should be between 0 and 1")
            return False
        
        # Validate estimatedValue ≈ estimatedWeightKg * marketPrice
        expected_value = data['estimatedWeightKg'] * data['marketPrice']
        if abs(data['estimatedValue'] - expected_value) > 0.01:
            print(f"❌ FAILED: estimatedValue {data['estimatedValue']} doesn't match estimatedWeightKg * marketPrice = {expected_value}")
            return False
        
        print("✅ PASSED: Scan without data URL prefix returns valid response")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def test_stats_after_scan():
    """Test GET /api/stats after successful scans"""
    print("\n" + "="*60)
    print("TEST 7: GET /api/stats (after scans)")
    print("="*60)
    
    try:
        response = requests.get(f"{API_BASE}/stats", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # After at least 2 successful scans, totalScans should be >= 2
        if data['totalScans'] < 2:
            print(f"❌ FAILED: Expected totalScans >= 2 after successful scans, got {data['totalScans']}")
            return False
        
        print(f"✅ PASSED: Stats shows totalScans = {data['totalScans']} (>= 2 as expected)")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def test_places_singapore():
    """Test GET /api/places with Singapore coordinates"""
    print("\n" + "="*60)
    print("TEST 8: GET /api/places (Singapore lat/lng)")
    print("="*60)
    
    try:
        params = {
            'lat': '1.3521',
            'lng': '103.8198'
        }
        
        print(f"Requesting places for Singapore (lat={params['lat']}, lng={params['lng']})...")
        print("This may take up to 30s as it calls Google Places API...")
        response = requests.get(f"{API_BASE}/places", params=params, timeout=35)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        print(f"Number of places returned: {data.get('count', 0)}")
        
        # Validate response shape
        required_fields = ['places', 'count', 'queriedAt']
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing '{field}' field")
                return False
        
        # Validate places is an array
        if not isinstance(data['places'], list):
            print("❌ FAILED: 'places' should be an array")
            return False
        
        # Should return at least 10 places
        if len(data['places']) < 10:
            print(f"❌ FAILED: Expected at least 10 places, got {len(data['places'])}")
            print(f"Places returned: {json.dumps(data['places'], indent=2)}")
            return False
        
        # Validate first place has correct shape
        if len(data['places']) > 0:
            place = data['places'][0]
            required_place_fields = ['id', 'name', 'type', 'category', 'color', 'address', 'lat', 'lng', 'rating', 'totalRatings', 'distance', 'openNow', 'icon', 'badge', 'photoRef']
            for field in required_place_fields:
                if field not in place:
                    print(f"❌ FAILED: Place missing '{field}' field")
                    return False
            
            # Validate category is valid
            valid_categories = ['plastic', 'textile', 'metal', 'glass', 'paper']
            if place['category'] not in valid_categories:
                print(f"❌ FAILED: Invalid category '{place['category']}'. Must be one of {valid_categories}")
                return False
            
            # Validate lat/lng are numbers
            if not isinstance(place['lat'], (int, float)):
                print("❌ FAILED: place.lat should be a number")
                return False
            if not isinstance(place['lng'], (int, float)):
                print("❌ FAILED: place.lng should be a number")
                return False
            
            # Validate distance is a number
            if not isinstance(place['distance'], (int, float)):
                print("❌ FAILED: place.distance should be a number")
                return False
            
            print(f"Sample place: {place['name']} ({place['category']}) - {place['distance']}km away")
        
        # Validate count matches array length
        if data['count'] != len(data['places']):
            print(f"❌ FAILED: count {data['count']} doesn't match places array length {len(data['places'])}")
            return False
        
        # Validate queriedAt is ISO string
        if not isinstance(data['queriedAt'], str):
            print("❌ FAILED: 'queriedAt' should be a string")
            return False
        
        print(f"✅ PASSED: Places endpoint returns {len(data['places'])} real recycling places for Singapore")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_places_category_plastic():
    """Test GET /api/places with category=plastic"""
    print("\n" + "="*60)
    print("TEST 9: GET /api/places (category=plastic)")
    print("="*60)
    
    try:
        params = {
            'lat': '1.3521',
            'lng': '103.8198',
            'category': 'plastic'
        }
        
        print(f"Requesting plastic recycling places...")
        response = requests.get(f"{API_BASE}/places", params=params, timeout=35)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Number of plastic places returned: {len(data.get('places', []))}")
        
        # Validate response shape
        if 'places' not in data or not isinstance(data['places'], list):
            print("❌ FAILED: Missing or invalid 'places' field")
            return False
        
        # All places should be plastic category
        for place in data['places']:
            if place['category'] != 'plastic':
                print(f"❌ FAILED: Expected all places to be 'plastic' category, found '{place['category']}'")
                return False
        
        if len(data['places']) > 0:
            print(f"Sample plastic place: {data['places'][0]['name']} - {data['places'][0]['type']}")
        
        print(f"✅ PASSED: Category filter returns only plastic recycling places ({len(data['places'])} found)")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_places_category_metal():
    """Test GET /api/places with category=metal"""
    print("\n" + "="*60)
    print("TEST 10: GET /api/places (category=metal)")
    print("="*60)
    
    try:
        params = {
            'lat': '1.3521',
            'lng': '103.8198',
            'category': 'metal'
        }
        
        print(f"Requesting metal scrap yards...")
        response = requests.get(f"{API_BASE}/places", params=params, timeout=35)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Number of metal places returned: {len(data.get('places', []))}")
        
        # Validate response shape
        if 'places' not in data or not isinstance(data['places'], list):
            print("❌ FAILED: Missing or invalid 'places' field")
            return False
        
        # All places should be metal category
        for place in data['places']:
            if place['category'] != 'metal':
                print(f"❌ FAILED: Expected all places to be 'metal' category, found '{place['category']}'")
                return False
        
        if len(data['places']) > 0:
            print(f"Sample metal place: {data['places'][0]['name']} - {data['places'][0]['type']}")
        
        print(f"✅ PASSED: Category filter returns only metal scrap yards ({len(data['places'])} found)")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_places_missing_coords():
    """Test GET /api/places without lat or lng"""
    print("\n" + "="*60)
    print("TEST 11: GET /api/places (missing lat/lng)")
    print("="*60)
    
    try:
        # Test without lat
        print("Testing without lat parameter...")
        response = requests.get(f"{API_BASE}/places", params={'lng': '103.8198'}, timeout=10)
        print(f"Status Code (no lat): {response.status_code}")
        
        if response.status_code not in [400, 422]:
            print(f"❌ FAILED: Expected 4xx error without lat, got {response.status_code}")
            return False
        
        data = response.json()
        if 'error' not in data:
            print("❌ FAILED: Expected 'error' field in response")
            return False
        
        print(f"✅ Correctly returns 4xx error without lat: {data['error']}")
        
        # Test without lng
        print("\nTesting without lng parameter...")
        response = requests.get(f"{API_BASE}/places", params={'lat': '1.3521'}, timeout=10)
        print(f"Status Code (no lng): {response.status_code}")
        
        if response.status_code not in [400, 422]:
            print(f"❌ FAILED: Expected 4xx error without lng, got {response.status_code}")
            return False
        
        data = response.json()
        if 'error' not in data:
            print("❌ FAILED: Expected 'error' field in response")
            return False
        
        print(f"✅ Correctly returns 4xx error without lng: {data['error']}")
        
        # Test without both
        print("\nTesting without both lat and lng...")
        response = requests.get(f"{API_BASE}/places", timeout=10)
        print(f"Status Code (no coords): {response.status_code}")
        
        if response.status_code not in [400, 422]:
            print(f"❌ FAILED: Expected 4xx error without coords, got {response.status_code}")
            return False
        
        print("✅ PASSED: Missing coordinates correctly return 4xx errors")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_places_invalid_coords():
    """Test GET /api/places with invalid (non-numeric) lat/lng"""
    print("\n" + "="*60)
    print("TEST 12: GET /api/places (invalid lat/lng)")
    print("="*60)
    
    try:
        # Test with non-numeric lat
        print("Testing with non-numeric lat...")
        response = requests.get(f"{API_BASE}/places", params={'lat': 'invalid', 'lng': '103.8198'}, timeout=10)
        print(f"Status Code (invalid lat): {response.status_code}")
        
        if response.status_code not in [400, 422]:
            print(f"❌ FAILED: Expected 4xx error with invalid lat, got {response.status_code}")
            return False
        
        data = response.json()
        if 'error' not in data:
            print("❌ FAILED: Expected 'error' field in response")
            return False
        
        print(f"✅ Correctly returns 4xx error with invalid lat: {data['error']}")
        
        # Test with non-numeric lng
        print("\nTesting with non-numeric lng...")
        response = requests.get(f"{API_BASE}/places", params={'lat': '1.3521', 'lng': 'invalid'}, timeout=10)
        print(f"Status Code (invalid lng): {response.status_code}")
        
        if response.status_code not in [400, 422]:
            print(f"❌ FAILED: Expected 4xx error with invalid lng, got {response.status_code}")
            return False
        
        data = response.json()
        if 'error' not in data:
            print("❌ FAILED: Expected 'error' field in response")
            return False
        
        print(f"✅ Correctly returns 4xx error with invalid lng: {data['error']}")
        
        print("✅ PASSED: Invalid coordinates correctly return 4xx errors")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("SCRAPVALUE BACKEND API TEST SUITE")
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print("="*60)
    
    results = {}
    
    # Test 1: Root endpoint
    results['GET /api'] = test_api_root()
    
    # Test 2: Market endpoint
    results['GET /api/market'] = test_market_endpoint()
    
    # Test 3: Stats endpoint (initial)
    results['GET /api/stats (initial)'] = test_stats_endpoint_empty()
    
    # Test 4: Scan with missing image
    results['POST /api/scan (missing image)'] = test_scan_missing_image()
    
    # Test 5: Scan with data URL prefix
    results['POST /api/scan (with prefix)'] = test_scan_with_prefix()
    
    # Test 6: Scan without data URL prefix
    results['POST /api/scan (without prefix)'] = test_scan_without_prefix()
    
    # Test 7: Stats after scans
    results['GET /api/stats (after scans)'] = test_stats_after_scan()
    
    # Test 8: Places with Singapore coordinates
    results['GET /api/places (Singapore)'] = test_places_singapore()
    
    # Test 9: Places with category=plastic
    results['GET /api/places (category=plastic)'] = test_places_category_plastic()
    
    # Test 10: Places with category=metal
    results['GET /api/places (category=metal)'] = test_places_category_metal()
    
    # Test 11: Places without lat/lng
    results['GET /api/places (missing coords)'] = test_places_missing_coords()
    
    # Test 12: Places with invalid lat/lng
    results['GET /api/places (invalid coords)'] = test_places_invalid_coords()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print("\n" + "="*60)
    print(f"TOTAL: {passed}/{total} tests passed")
    print("="*60)
    
    return passed == total


if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
