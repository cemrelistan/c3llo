fetch('https://obs.itu.edu.tr/public/DersProgram')
  .then(r => r.text())
  .then(t => {
    const match = t.match(/<select class="form-control" id="dersBransKoduId"[\s\S]*?<\/select>/);
    if (match) {
      const options = match[0].match(/<option value="(\d+)">([A-Z]+)/g);
      console.log(options.join('\n'));
    } else {
      console.log("no match");
    }
  });
