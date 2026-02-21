#!/bin/bash
# phase05-test.sh - Automated testing script for Phase 05
# Tests permissions, build artifacts, and prepares for manual testing

set -e  # Exit on error

echo "=== Phase 05: MindSweeper Extension Testing ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

function pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

function fail() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

function warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "Step 1: Clean and rebuild..."
rm -rf dist/
npm run build
if [ $? -eq 0 ]; then
    pass "Build complete"
else
    fail "Build failed"
    exit 1
fi
echo ""

echo "Step 2: Run unit tests..."
npm test -- --run 2>&1 | tee test-output.log
if [ $? -eq 0 ]; then
    pass "Unit tests passed"
else
    fail "Unit tests failed"
    exit 1
fi
echo ""

echo "Step 3: Verify build artifacts..."
if [ -d "dist/" ]; then
    pass "dist/ folder exists"
else
    fail "dist/ folder missing"
    exit 1
fi

if [ -f "dist/manifest.json" ]; then
    pass "manifest.json found in dist/"
else
    fail "manifest.json not found in dist/"
    exit 1
fi

# Check for required entry points
if [ -d "dist/src/popup" ]; then
    pass "Popup build artifacts present"
else
    warn "Popup build artifacts not found in expected location"
fi

if [ -d "dist/src/options" ]; then
    pass "Options build artifacts present"
else
    warn "Options build artifacts not found in expected location"
fi

if [ -d "dist/src/background" ]; then
    pass "Background build artifacts present"
else
    warn "Background build artifacts not found in expected location"
fi

echo ""

echo "Step 4: Validate manifest permissions..."
if [ -f "dist/manifest.json" ]; then
    PERMS=$(grep '"permissions"' dist/manifest.json -A 5)
    if echo "$PERMS" | grep -q 'storage'; then
        pass "Storage permission found"
    else
        fail "Storage permission missing"
    fi
    
    if echo "$PERMS" | grep -q 'alarms'; then
        pass "Alarms permission found"
    else
        fail "Alarms permission missing"
    fi
    
    # Check that host_permissions is NOT present
    if grep -q '"host_permissions"' dist/manifest.json; then
        fail "Unnecessary host_permissions found"
    else
        pass "No host_permissions (good!)"
    fi
    
    # Verify manifest version
    if grep -q '"manifest_version": 3' dist/manifest.json; then
        pass "Manifest v3 detected"
    else
        fail "Not using Manifest v3"
    fi
else
    fail "Cannot validate permissions - manifest.json missing"
fi
echo ""

echo "Step 5: Check icon files..."
for size in 16 48 128; do
    # Check in both public/ and dist/public/
    if [ -f "public/icon${size}.png" ]; then
        pass "icon${size}.png found in public/"
    else
        fail "icon${size}.png missing from public/"
    fi
done
echo ""

echo "Step 6: Check documentation..."
if [ -f "PERMISSIONS.md" ]; then
    pass "PERMISSIONS.md exists"
else
    fail "PERMISSIONS.md missing"
fi

if [ -f "PHASE_05_TESTING.md" ]; then
    pass "PHASE_05_TESTING.md exists"
else
    fail "PHASE_05_TESTING.md missing"
fi
echo ""

echo "Step 7: Generate test report..."
echo "=== TEST SUMMARY ===" > phase05-test-report.txt
echo "Date: $(date)" >> phase05-test-report.txt
echo "Tests Passed: $TESTS_PASSED" >> phase05-test-report.txt
echo "Tests Failed: $TESTS_FAILED" >> phase05-test-report.txt
echo "" >> phase05-test-report.txt

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}=== All automated checks passed! ===${NC}"
    echo "Status: PASS" >> phase05-test-report.txt
else
    echo -e "${RED}=== Some automated checks failed ===${NC}"
    echo "Status: FAIL" >> phase05-test-report.txt
fi

echo ""
echo "Test report saved to: phase05-test-report.txt"
echo ""

echo "=== Next Steps for Manual Testing ==="
echo ""
echo "1. Load extension in Chrome:"
echo "   - Open chrome://extensions"
echo "   - Enable 'Developer mode'"
echo "   - Click 'Load unpacked'"
echo "   - Select the dist/ folder"
echo ""
echo "2. Follow manual test procedures in PHASE_05_TESTING.md:"
echo "   - Test offline functionality (Network tab → Offline)"
echo "   - Test popup UI and game features"
echo "   - Test options page and settings persistence"
echo "   - Test service worker and background timer"
echo "   - Test state persistence across sessions"
echo ""
echo "3. Review permissions in chrome://extensions:"
echo "   - Verify only 'storage' and 'alarms' are listed"
echo ""
echo "4. Check for errors:"
echo "   - Open service worker DevTools"
echo "   - Check console for errors"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
