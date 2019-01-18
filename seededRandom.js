////////////////////////////////////////////////////////////////////////////////////
//////////                   RANDOM NUMBER HANDLING                  ///////////////
////////////////////////////////////////////////////////////////////////////////////
// Javascript does not natively support seeding in Math.random()
// This solution implements such seeding (as taken from https://gist.github.com/blixt/f17b47c62508be59987b)
// The speed is on par with Marth.random
// Robustness could be improved by returning mb32( hash(seed++) )() each time instead of the mb32 object. It would then take twice as long to excecute

function seededRandom (seed = (new Date()).getTime()) {
    // Mulberry32, a fast high quality PRNG: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
    var mb32=s=>t=>(s=s+1831565813|0,t=Math.imul(s^s>>>15,1|s),t=t+Math.imul(t^t>>>7,61|t)^t,(t^t>>>14)>>>0)/2**32;
    // Better 32-bit integer hash function: https://burtleburtle.net/bob/hash/integer.html
    var hash=n=>(n=61^n^n>>>16,n+=n<<3,n=Math.imul(n,668265261),n^=n>>>15)>>>0;

    // could be make more robust by varying the seed each time
    return mb32( hash(seed) );
}

var seededRand = seededRandom();