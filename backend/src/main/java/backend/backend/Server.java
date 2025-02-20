package backend.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class Server {
    @GetMapping("path")
    public String getMethodName(@RequestParam String param) {
        return new String();
    }
}